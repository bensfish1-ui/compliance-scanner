import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import OpenAI from 'openai';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRegulationDto } from './dto/create-regulation.dto';
import { UpdateRegulationDto } from './dto/update-regulation.dto';
import { RegulationQueryDto } from './dto/regulation-query.dto';
import { buildPaginatedResponse, PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class RegulationsService {
  private readonly logger = new Logger(RegulationsService.name);
  private openai: OpenAI | null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
  ) {
    const apiKey =
      this.configService.get<string>('openai.apiKey') ||
      this.configService.get<string>('OPENAI_API_KEY');

    if (apiKey && apiKey.length > 0) {
      this.openai = new OpenAI({ apiKey });
    } else {
      this.openai = null;
      this.logger.warn('OpenAI API key not configured — gap analysis generation disabled');
    }
  }

  async create(dto: CreateRegulationDto, user: AuthenticatedUser) {
    const slug = dto.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();

    const regulation = await this.prisma.regulation.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        summary: dto.body,
        countryId: dto.countryId,
        regulatorId: dto.regulatorId,
        categoryId: dto.categoryId,
        status: dto.status as any,
        impactLevel: dto.impactLevel as any,
        lifecycleStage: dto.lifecycleStage as any,
        effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : null,
        enforcementDate: dto.complianceDeadline ? new Date(dto.complianceDeadline) : null,
        sourceUrl: dto.sourceUrl,
        keywords: dto.tags || [],
        notes: dto.notes,
        ownerId: dto.ownerId || user.sub,
        // Connect business areas if provided
        ...(dto.businessAreaIds && dto.businessAreaIds.length > 0
          ? {
              businessAreas: {
                create: dto.businessAreaIds.map((baId) => ({ businessAreaId: baId })),
              },
            }
          : {}),
      },
      include: {
        country: true,
        regulator: true,
        category: true,
        owner: true,
        businessAreas: true,
      },
    });

    this.eventEmitter.emit('regulation.created', {
      regulationId: regulation.id,
      userId: user.sub,
      regulation,
    });

    this.logger.log(`Regulation created: ${regulation.id} - ${regulation.title}`);
    return regulation;
  }

  async findAll(query: RegulationQueryDto): Promise<PaginatedResponseDto<any>> {
    const where: any = {};

    if (query.countryId) where.countryId = query.countryId;
    if (query.regulatorId) where.regulatorId = query.regulatorId;
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.status) where.status = query.status;
    if (query.impactLevel) where.impactLevel = query.impactLevel;
    if (query.lifecycleStage) where.lifecycleStage = query.lifecycleStage;
    if (query.ownerId) where.ownerId = query.ownerId;

    if (query.dateFrom || query.dateTo) {
      where.effectiveDate = {};
      if (query.dateFrom) where.effectiveDate.gte = new Date(query.dateFrom);
      if (query.dateTo) where.effectiveDate.lte = new Date(query.dateTo);
    }

    if (query.businessAreaId) {
      where.businessAreas = { some: { businessAreaId: query.businessAreaId } };
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.regulation.findMany({
        where,
        skip: query.skip,
        take: query.limit,
        orderBy: query.orderBy || { createdAt: 'desc' },
        include: {
          country: true,
          regulator: true,
          category: true,
          owner: true,
          _count: {
            select: {
              obligations: true,
              projects: true,
              impactAssessments: true,
            },
          },
        },
      }),
      this.prisma.regulation.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, query);
  }

  async findOne(id: string) {
    const regulation = await this.prisma.regulation.findUnique({
      where: { id },
      include: {
        country: true,
        regulator: true,
        category: true,
        owner: true,
        businessAreas: true,
        obligations: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
        projects: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        impactAssessments: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        evidenceFiles: {
          take: 20,
        },
      },
    });

    if (!regulation) {
      throw new NotFoundException(`Regulation with ID ${id} not found`);
    }

    return regulation;
  }

  async update(id: string, dto: UpdateRegulationDto, user: AuthenticatedUser) {
    await this.findOne(id);

    const { businessAreaIds, complianceDeadline, publishedDate, tags, body, referenceCode, priorityScore, ...rest } = dto as any;

    const regulation = await this.prisma.regulation.update({
      where: { id },
      data: {
        ...rest,
        ...(body !== undefined ? { summary: body } : {}),
        ...(tags !== undefined ? { keywords: tags } : {}),
        effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : undefined,
        ...(complianceDeadline !== undefined ? { enforcementDate: complianceDeadline ? new Date(complianceDeadline) : null } : {}),
      },
      include: {
        country: true,
        regulator: true,
        category: true,
        owner: true,
        businessAreas: true,
      },
    });

    this.eventEmitter.emit('regulation.updated', {
      regulationId: regulation.id,
      userId: user.sub,
      changes: dto,
      regulation,
    });

    return regulation;
  }

  async archive(id: string, _user: AuthenticatedUser) {
    await this.findOne(id);

    const regulation = await this.prisma.regulation.update({
      where: { id },
      data: {
        isArchived: true,
      },
    });

    this.eventEmitter.emit('regulation.archived', {
      regulationId: id,
      userId: _user.sub,
    });

    return regulation;
  }

  async getTimeline(id: string) {
    await this.findOne(id);

    const activityLogs = await this.prisma.activityLog.findMany({
      where: {
        entityType: 'Regulation',
        entityId: id,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return activityLogs;
  }

  async getRelated(id: string) {
    const regulation = await this.findOne(id);

    const related = await this.prisma.regulation.findMany({
      where: {
        id: { not: id },
        OR: [
          { countryId: regulation.countryId },
          { categoryId: regulation.categoryId },
          { regulatorId: regulation.regulatorId },
        ],
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        country: true,
        category: true,
      },
    });

    return related;
  }

  async getObligations(id: string) {
    await this.findOne(id);

    return this.prisma.obligation.findMany({
      where: { regulationId: id, isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        controls: true,
      },
    });
  }

  async addBusinessArea(regulationId: string, businessAreaId: string) {
    await this.findOne(regulationId);

    return this.prisma.regulationBusinessArea.create({
      data: {
        regulationId,
        businessAreaId,
      },
    });
  }

  async removeBusinessArea(regulationId: string, businessAreaId: string) {
    await this.findOne(regulationId);

    return this.prisma.regulationBusinessArea.deleteMany({
      where: { regulationId, businessAreaId },
    });
  }

  async triggerAIAnalysis(id: string, user: AuthenticatedUser) {
    const regulation = await this.findOne(id);

    if (!regulation.summary && !regulation.description) {
      throw new BadRequestException(
        'Regulation must have a description or summary to analyze',
      );
    }

    this.eventEmitter.emit('regulation.ai-analysis-requested', {
      regulationId: id,
      userId: user.sub,
    });

    return { message: 'AI analysis queued successfully', regulationId: id };
  }

  // ──────────── AI Generation Methods ────────────

  private ensureOpenAI(): void {
    if (!this.openai) {
      throw new BadRequestException(
        'Gap analysis generation requires an OpenAI API key. Set OPENAI_API_KEY to enable.',
      );
    }
  }

  private async logAI(
    action: string,
    duration: number,
    inputTokens: number,
    outputTokens: number,
    prompt?: string,
    response?: string,
  ): Promise<void> {
    try {
      await this.prisma.aILog.create({
        data: {
          action,
          model: 'gpt-4-turbo',
          promptTokens: inputTokens,
          completionTokens: outputTokens,
          totalTokens: inputTokens + outputTokens,
          latency: duration,
          prompt: prompt?.substring(0, 10000) || null,
          response: response?.substring(0, 10000) || null,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log AI usage: ${(error as Error).message}`);
    }
  }

  async generateGapAnalysisAudit(regulationId: string, user: AuthenticatedUser) {
    this.ensureOpenAI();

    const regulation = await this.prisma.regulation.findUnique({
      where: { id: regulationId },
      include: {
        country: true,
        category: true,
        obligations: true,
        businessAreas: { include: { businessArea: true } },
      },
    });

    if (!regulation) {
      throw new NotFoundException(`Regulation with ID ${regulationId} not found`);
    }

    const obligationsList = regulation.obligations
      .map((o, i) => `${i + 1}. ${o.title}: ${o.description || 'No description'}`)
      .join('\n');

    const businessAreasList = regulation.businessAreas
      .map((ba) => ba.businessArea?.name || 'Unknown')
      .join(', ');

    const prompt = `You are a senior compliance auditor. Generate a comprehensive gap analysis audit plan for the following regulation.

REGULATION: ${regulation.title}
DESCRIPTION: ${regulation.description || regulation.summary || 'N/A'}
COUNTRY/JURISDICTION: ${regulation.country?.name || 'N/A'}
CATEGORY: ${regulation.category?.name || 'N/A'}
EFFECTIVE DATE: ${regulation.effectiveDate || 'N/A'}
ENFORCEMENT DATE: ${regulation.enforcementDate || 'N/A'}
IMPACT LEVEL: ${regulation.impactLevel || 'N/A'}

KNOWN OBLIGATIONS:
${obligationsList || 'None defined yet'}

AFFECTED BUSINESS AREAS: ${businessAreasList || 'Not specified'}

Generate the following as a JSON object:
{
  "scope": "Detailed scope statement for the gap analysis audit (2-3 sentences)",
  "objectives": "Key objectives of this gap analysis (2-3 sentences)",
  "questions": [
    {
      "theme": "Theme name (e.g. Data Governance, Access Controls)",
      "question": "Specific audit question to assess compliance gap",
      "riskArea": "What risk this question addresses",
      "expectedEvidence": "What evidence the auditor should request"
    }
  ],
  "interviewGuide": [
    {
      "stakeholderRole": "Role to interview (e.g. DPO, CISO, Head of Legal)",
      "questions": ["Interview question 1", "Interview question 2", "Interview question 3"]
    }
  ],
  "checklist": [
    {
      "category": "Category name",
      "items": ["Document or evidence item to check"]
    }
  ],
  "gapAreas": [
    {
      "title": "Gap area title",
      "description": "Description of the potential gap",
      "severity": "CRITICAL | MAJOR | MINOR | OBSERVATION",
      "recommendation": "Recommended remediation action"
    }
  ]
}

Generate 10-20 audit questions grouped by 3-6 themes. Include 3-5 stakeholder interview guides with 3-4 questions each. Include 4-8 checklist categories. Identify 5-10 key gap areas.`;

    const startTime = Date.now();

    const completion = await this.openai!.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert compliance auditor. Always respond with valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 4096,
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    const duration = Date.now() - startTime;
    const inputTokens = completion.usage?.prompt_tokens || Math.ceil(prompt.length / 4);
    const outputTokens = completion.usage?.completion_tokens || Math.ceil(responseText.length / 4);

    await this.logAI('generate-gap-analysis', duration, inputTokens, outputTokens, prompt, responseText);

    let aiResult: any;
    try {
      aiResult = JSON.parse(responseText);
    } catch {
      throw new BadRequestException('Failed to parse AI response. Please try again.');
    }

    // Find admin user for lead auditor
    const adminUser = await this.prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const leadAuditorId = adminUser?.id || user.sub;

    // Create the Audit record
    const audit = await this.prisma.audit.create({
      data: {
        title: `Gap Analysis: ${regulation.title}`,
        description: `Automated gap analysis audit generated from regulation "${regulation.title}" to assess current compliance posture against regulatory requirements.`,
        type: 'COMPLIANCE',
        status: 'PLANNED',
        regulationId: regulation.id,
        leadAuditorId,
        scope: aiResult.scope || null,
        objectives: aiResult.objectives || null,
        methodology: 'Gap Analysis - Assessing current compliance posture against regulatory requirements',
        aiGeneratedQuestions: aiResult.questions || [],
        aiInterviewGuide: aiResult.interviewGuide || [],
        aiChecklist: aiResult.checklist || [],
        startDate: new Date(),
      },
    });

    // Create Finding records for each gap area
    const severityMap: Record<string, string> = {
      CRITICAL: 'CRITICAL',
      MAJOR: 'MAJOR',
      MINOR: 'MINOR',
      OBSERVATION: 'OBSERVATION',
    };

    const findings = [];
    if (Array.isArray(aiResult.gapAreas)) {
      for (const gap of aiResult.gapAreas) {
        const finding = await this.prisma.finding.create({
          data: {
            auditId: audit.id,
            title: gap.title,
            description: gap.description,
            severity: (severityMap[gap.severity] as any) || 'MINOR',
            status: 'OPEN',
            recommendation: gap.recommendation || null,
            ownerId: leadAuditorId,
          },
        });
        findings.push(finding);
      }
    }

    this.logger.log(`Gap analysis audit created: ${audit.id} with ${findings.length} findings for regulation ${regulation.id}`);

    return {
      ...audit,
      findings,
      regulation: { id: regulation.id, title: regulation.title },
    };
  }

  async generateImplementationProject(regulationId: string, user: AuthenticatedUser) {
    this.ensureOpenAI();

    const regulation = await this.prisma.regulation.findUnique({
      where: { id: regulationId },
      include: {
        country: true,
        category: true,
        obligations: true,
        businessAreas: { include: { businessArea: true } },
      },
    });

    if (!regulation) {
      throw new NotFoundException(`Regulation with ID ${regulationId} not found`);
    }

    const obligationsList = regulation.obligations
      .map((o, i) => `${i + 1}. ${o.title}: ${o.description || 'No description'}`)
      .join('\n');

    const businessAreasList = regulation.businessAreas
      .map((ba) => ba.businessArea?.name || 'Unknown')
      .join(', ');

    const prompt = `You are a senior project manager specialising in regulatory compliance implementations. Generate a comprehensive implementation project plan for the following regulation.

REGULATION: ${regulation.title}
DESCRIPTION: ${regulation.description || regulation.summary || 'N/A'}
COUNTRY/JURISDICTION: ${regulation.country?.name || 'N/A'}
CATEGORY: ${regulation.category?.name || 'N/A'}
EFFECTIVE DATE: ${regulation.effectiveDate || 'N/A'}
ENFORCEMENT DATE: ${regulation.enforcementDate || 'N/A'}
IMPACT LEVEL: ${regulation.impactLevel || 'N/A'}

KNOWN OBLIGATIONS:
${obligationsList || 'None defined yet'}

AFFECTED BUSINESS AREAS: ${businessAreasList || 'Not specified'}

Generate the following as a JSON object:
{
  "description": "Project description (2-3 sentences)",
  "totalDurationWeeks": 24,
  "milestones": [
    {
      "title": "Phase name (e.g. Assessment, Planning, Implementation, Testing, Go-Live, Post-Implementation Review)",
      "description": "Phase description",
      "durationWeeks": 4,
      "order": 1,
      "tasks": [
        {
          "title": "Task title",
          "description": "Task description",
          "priority": "CRITICAL | HIGH | MEDIUM | LOW",
          "estimatedHours": 40,
          "dependsOnTaskIndex": null,
          "order": 1
        }
      ]
    }
  ],
  "budgetConsiderations": "Budget notes and considerations",
  "risks": [
    { "risk": "Risk description", "mitigation": "Mitigation strategy" }
  ],
  "stakeholders": [
    { "role": "Stakeholder role", "responsibility": "Key responsibility" }
  ]
}

Generate 5-7 milestones/phases with 3-6 tasks each. Use realistic duration estimates. Task dependsOnTaskIndex should reference the global 0-based index of a task in a previous milestone if applicable, or null.`;

    const startTime = Date.now();

    const completion = await this.openai!.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert compliance project manager. Always respond with valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 4096,
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    const duration = Date.now() - startTime;
    const inputTokens = completion.usage?.prompt_tokens || Math.ceil(prompt.length / 4);
    const outputTokens = completion.usage?.completion_tokens || Math.ceil(responseText.length / 4);

    await this.logAI('generate-implementation-project', duration, inputTokens, outputTokens, prompt, responseText);

    let aiResult: any;
    try {
      aiResult = JSON.parse(responseText);
    } catch {
      throw new BadRequestException('Failed to parse AI response. Please try again.');
    }

    // Find admin user for owner
    const adminUser = await this.prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const ownerId = adminUser?.id || user.sub;

    // Calculate end date
    const totalWeeks = aiResult.totalDurationWeeks || 24;
    const startDate = new Date();
    let endDate: Date;
    if (regulation.effectiveDate && new Date(regulation.effectiveDate) > startDate) {
      endDate = new Date(regulation.effectiveDate);
    } else {
      endDate = new Date(startDate.getTime() + totalWeeks * 7 * 24 * 60 * 60 * 1000);
    }

    const slug = `impl-${regulation.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 150)}-${Date.now()}`;

    // Create the Project record
    const project = await this.prisma.project.create({
      data: {
        title: `Implementation: ${regulation.title}`,
        slug,
        description: aiResult.description || `Implementation project for ${regulation.title}`,
        regulationId: regulation.id,
        status: 'PLANNING',
        ownerId,
        startDate,
        endDate,
        ragStatus: 'GREEN',
        riskLog: aiResult.risks || [],
        stakeholders: aiResult.stakeholders || [],
      },
    });

    // Create Milestones and Tasks
    const createdMilestones = [];
    const allCreatedTasks: any[] = [];
    let cumulativeWeeks = 0;

    if (Array.isArray(aiResult.milestones)) {
      for (const msData of aiResult.milestones) {
        const msDueDate = new Date(
          startDate.getTime() + (cumulativeWeeks + (msData.durationWeeks || 4)) * 7 * 24 * 60 * 60 * 1000,
        );
        cumulativeWeeks += msData.durationWeeks || 4;

        const milestone = await this.prisma.milestone.create({
          data: {
            projectId: project.id,
            title: msData.title,
            description: msData.description || null,
            dueDate: msDueDate,
            status: 'NOT_STARTED',
            order: msData.order || 0,
          },
        });

        const msTasks = [];
        if (Array.isArray(msData.tasks)) {
          for (let ti = 0; ti < msData.tasks.length; ti++) {
            const taskData = msData.tasks[ti];
            const taskDueOffset = (cumulativeWeeks - (msData.durationWeeks || 4)) +
              ((ti + 1) / msData.tasks.length) * (msData.durationWeeks || 4);
            const taskDueDate = new Date(
              startDate.getTime() + taskDueOffset * 7 * 24 * 60 * 60 * 1000,
            );

            const priorityMap: Record<string, string> = {
              CRITICAL: 'CRITICAL',
              HIGH: 'HIGH',
              MEDIUM: 'MEDIUM',
              LOW: 'LOW',
            };

            const task = await this.prisma.task.create({
              data: {
                title: taskData.title,
                description: taskData.description || null,
                projectId: project.id,
                assigneeId: ownerId,
                reporterId: ownerId,
                status: 'TODO',
                priority: (priorityMap[taskData.priority] as any) || 'MEDIUM',
                dueDate: taskDueDate,
                estimatedHours: taskData.estimatedHours || null,
                order: taskData.order || ti,
                tags: [],
              },
            });

            const globalIndex = allCreatedTasks.length;
            allCreatedTasks.push({ task, sourceIndex: globalIndex });
            msTasks.push(task);

            // Create dependency if specified
            if (
              taskData.dependsOnTaskIndex != null &&
              taskData.dependsOnTaskIndex >= 0 &&
              taskData.dependsOnTaskIndex < allCreatedTasks.length - 1
            ) {
              const depTarget = allCreatedTasks[taskData.dependsOnTaskIndex];
              if (depTarget) {
                await this.prisma.taskDependency.create({
                  data: {
                    taskId: task.id,
                    dependsOnTaskId: depTarget.task.id,
                    type: 'FS',
                  },
                });
              }
            }
          }
        }

        createdMilestones.push({ ...milestone, tasks: msTasks });
      }
    }

    this.logger.log(
      `Implementation project created: ${project.id} with ${createdMilestones.length} milestones and ${allCreatedTasks.length} tasks for regulation ${regulation.id}`,
    );

    return {
      ...project,
      milestones: createdMilestones,
      taskCount: allCreatedTasks.length,
      regulation: { id: regulation.id, title: regulation.title },
    };
  }

  async getStatistics() {
    const [
      totalCount,
      byStatus,
      byImpactLevel,
      byLifecycleStage,
      upcomingDeadlines,
      recentlyCreated,
    ] = await Promise.all([
      this.prisma.regulation.count({ where: { isArchived: false } }),

      this.prisma.regulation.groupBy({
        by: ['status'],
        where: { isArchived: false },
        _count: { id: true },
      }),

      this.prisma.regulation.groupBy({
        by: ['impactLevel'],
        where: { isArchived: false },
        _count: { id: true },
      }),

      this.prisma.regulation.groupBy({
        by: ['lifecycleStage'],
        where: { isArchived: false },
        _count: { id: true },
      }),

      this.prisma.regulation.count({
        where: {
          isArchived: false,
          enforcementDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      this.prisma.regulation.count({
        where: {
          isArchived: false,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      total: totalCount,
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.id })),
      byImpactLevel: byImpactLevel.map((i) => ({ impactLevel: i.impactLevel, count: i._count.id })),
      byLifecycleStage: byLifecycleStage.map((l) => ({ stage: l.lifecycleStage, count: l._count.id })),
      upcomingDeadlines,
      recentlyCreated,
    };
  }
}
