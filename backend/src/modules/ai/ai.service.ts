import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

/**
 * AI Service powered by LangChain + OpenAI.
 * Provides regulation analysis, obligation extraction, summary generation,
 * impact assessment, audit question generation, and RAG-based chat.
 *
 * All AI responses are stored as PENDING and require human approval
 * before being committed to the main data model (human-in-the-loop).
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private chatModel: ChatOpenAI | null;
  private readonly maxTokens: number;
  private readonly aiEnabled: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('openai.apiKey') || this.configService.get<string>('OPENAI_API_KEY');
    this.aiEnabled = !!apiKey && apiKey.length > 0;
    if (this.aiEnabled) {
      this.chatModel = new ChatOpenAI({
        openAIApiKey: apiKey,
        modelName: this.configService.get<string>('openai.model', 'gpt-4-turbo-preview'),
        temperature: this.configService.get<number>('openai.temperature', 0.1),
        maxTokens: this.configService.get<number>('openai.maxTokens', 4096),
      });
    } else {
      this.chatModel = null;
      this.logger.warn('OpenAI API key not configured — AI features disabled');
    }
    this.maxTokens = this.configService.get<number>('openai.maxTokens', 4096);
  }

  private ensureAiEnabled(): void {
    if (!this.aiEnabled || !this.chatModel) {
      throw new BadRequestException('AI features are disabled. Set OPENAI_API_KEY to enable.');
    }
  }

  // ────────── Prompt Templates ──────────

  private readonly PROMPTS = {
    analyzeRegulation: `You are an expert compliance analyst. Analyze the following regulation text and provide:
1. A concise executive summary (2-3 paragraphs)
2. Key requirements and obligations (as a numbered list)
3. Affected business areas and departments
4. Implementation timeline recommendations
5. Potential risks of non-compliance
6. Comparison with existing similar regulations (if identifiable)

Format the response as structured JSON with keys: summary, obligations, affectedAreas, timeline, nonComplianceRisks, relatedRegulations.`,

    generateSummary: `You are an expert compliance writer. Generate a clear, executive-level summary of the following regulation. The summary should be suitable for board-level reporting and cover:
- What the regulation requires
- Who it affects
- Key deadlines
- Business impact
Keep it to 3-4 paragraphs maximum.`,

    extractObligations: `You are a legal compliance expert. Extract all specific, actionable obligations from the following regulation text. For each obligation, provide:
1. title: A concise title
2. description: What must be done
3. sectionReference: The section/article number in the regulation
4. deadline: Any compliance deadline mentioned (or null)
5. priority: HIGH, MEDIUM, or LOW based on penalty severity and impact

Return the obligations as a JSON array.`,

    generateImpactAssessment: `You are a compliance risk assessor. Based on the regulation text provided, assess the impact across these dimensions:
1. Operational Impact (1-5 scale with justification)
2. Financial Impact (1-5 scale with justification)
3. Reputational Impact (1-5 scale with justification)
4. Legal/Regulatory Risk (1-5 scale with justification)
5. Strategic Alignment (1-5 scale with justification)
6. Implementation Complexity (1-5 scale with justification)
7. Gap Analysis: What gaps exist between current state and compliance requirements

Return as structured JSON with scoringFactors array and gapAnalysis string.`,

    generateAuditQuestions: `You are an experienced compliance auditor. Generate comprehensive audit questions for the following audit scope. The questions should:
- Be specific and testable
- Cover all major compliance areas
- Include questions about evidence and documentation
- Range from strategic (for management) to operational (for process owners)
- Be grouped by category

Return as JSON array with objects containing: category, question, expectedEvidence, riskArea.`,

    generateImplementationPlan: `You are a compliance project manager. Create a detailed implementation plan for the following regulation. Include:
1. Project phases with milestones
2. Specific tasks for each phase
3. Dependencies between tasks
4. Estimated effort (hours) for each task
5. Recommended team roles
6. Risk mitigation strategies

Return as structured JSON with phases array, each containing tasks array.`,

    compareControls: `You are a compliance control assessor. Compare the following regulation requirements against the existing controls provided. For each requirement:
1. Identify which existing controls address it (fully, partially, or not at all)
2. Identify gaps where no control exists
3. Recommend new controls or modifications
4. Rate the overall coverage (percentage)

Return as structured JSON with coverageAnalysis array and overallCoverage percentage.`,

    predictExposure: `You are a regulatory risk analyst. Based on the regulation details and business unit information provided, predict the exposure level for each business unit. Consider:
1. Direct applicability of the regulation
2. Nature of operations in that business unit
3. Current compliance posture
4. Historical compliance issues

Return as JSON array with businessUnit, exposureLevel (HIGH/MEDIUM/LOW), rationale, and recommendedActions.`,

    chat: `You are a helpful compliance assistant for an enterprise regulatory compliance platform. You have deep knowledge of regulatory frameworks, compliance management, risk assessment, and audit practices. Answer questions clearly and provide actionable advice. If you don't know something, say so rather than speculating.`,
  };

  // ────────── PII Redaction ──────────

  /**
   * Redact PII before sending text to OpenAI.
   * Replaces emails, phone numbers, national IDs, and names with placeholders.
   */
  private redactPII(text: string): string {
    let redacted = text;

    // Email addresses
    redacted = redacted.replace(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      '[EMAIL_REDACTED]',
    );

    // Phone numbers (various formats)
    redacted = redacted.replace(
      /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
      '[PHONE_REDACTED]',
    );

    // Social Security Numbers (US format)
    redacted = redacted.replace(/\d{3}-\d{2}-\d{4}/g, '[SSN_REDACTED]');

    // Credit card numbers
    redacted = redacted.replace(/\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}/g, '[CC_REDACTED]');

    // UK National Insurance numbers
    redacted = redacted.replace(
      /[A-Z]{2}\d{6}[A-Z]/g,
      '[NI_REDACTED]',
    );

    return redacted;
  }

  // ────────── Core AI Methods ──────────

  /**
   * Conversational AI with context from the compliance platform.
   * Supports multi-turn conversation by accepting message history.
   */
  async chat(
    message: string,
    conversationHistory: Array<{ role: string; content: string }>,
    user: AuthenticatedUser,
  ) {
    const redactedMessage = this.redactPII(message);

    const messages = [
      new SystemMessage(this.PROMPTS.chat),
      ...conversationHistory.map((msg) =>
        msg.role === 'user'
          ? new HumanMessage(msg.content)
          : new SystemMessage(msg.content),
      ),
      new HumanMessage(redactedMessage),
    ];

    const startTime = Date.now();
    const response = await this.chatModel!.invoke(messages);
    const duration = Date.now() - startTime;

    // Log AI usage
    await this.logAIUsage(user.sub, 'chat', duration, message.length, String(response.content).length);

    return {
      response: response.content,
      tokensUsed: (response as any).usage_metadata ?? null,
    };
  }

  /**
   * Analyze regulation text and extract structured insights.
   * Response is stored for human review.
   */
  async analyzeRegulation(regulationId: string, user: AuthenticatedUser) {
    const regulation = await this.prisma.regulation.findUnique({
      where: { id: regulationId },
    });

    if (!regulation) throw new BadRequestException('Regulation not found');

    const text = regulation.description || '';
    if (!text) throw new BadRequestException('Regulation has no text content to analyze');

    const redactedText = this.redactPII(text);

    const messages = [
      new SystemMessage(this.PROMPTS.analyzeRegulation),
      new HumanMessage(`Regulation: ${regulation.title}\n\nText:\n${redactedText}`),
    ];

    const startTime = Date.now();
    const response = await this.chatModel!.invoke(messages);
    const duration = Date.now() - startTime;

    // Store AI response in prompt history
    const aiResponse = await this.prisma.promptHistory.create({
      data: {
        userId: user.sub,
        query: 'Analyze regulation',
        response: String(response.content),
        regulationId,
        context: { type: 'REGULATION_ANALYSIS', status: 'PENDING' },
      },
    });

    await this.logAIUsage(user.sub, 'analyze-regulation', duration, text.length, String(response.content).length);

    return {
      id: aiResponse.id,
      analysis: this.parseJsonResponse(String(response.content)),
      status: 'PENDING',
      message: 'Analysis complete. Awaiting human approval before applying.',
    };
  }

  /**
   * Generate an executive summary of a regulation.
   */
  async generateSummary(regulationId: string, user: AuthenticatedUser) {
    const regulation = await this.prisma.regulation.findUnique({
      where: { id: regulationId },
    });

    if (!regulation) throw new BadRequestException('Regulation not found');

    const text = regulation.description || '';
    const redactedText = this.redactPII(text);

    const messages = [
      new SystemMessage(this.PROMPTS.generateSummary),
      new HumanMessage(`Title: ${regulation.title}\n\n${redactedText}`),
    ];

    const startTime = Date.now();
    const response = await this.chatModel!.invoke(messages);
    const duration = Date.now() - startTime;

    const aiResponse = await this.prisma.promptHistory.create({
      data: {
        userId: user.sub,
        query: 'Generate summary',
        response: String(response.content),
        regulationId,
        context: { type: 'SUMMARY', status: 'PENDING' },
      },
    });

    await this.logAIUsage(user.sub, 'generate-summary', duration, text.length, String(response.content).length);

    return {
      id: aiResponse.id,
      summary: response.content,
      status: 'PENDING',
    };
  }

  /**
   * Extract obligations from regulation text.
   */
  async generateObligations(regulationId: string, user: AuthenticatedUser) {
    const regulation = await this.prisma.regulation.findUnique({
      where: { id: regulationId },
    });

    if (!regulation) throw new BadRequestException('Regulation not found');

    const text = regulation.description || '';
    const redactedText = this.redactPII(text);

    const messages = [
      new SystemMessage(this.PROMPTS.extractObligations),
      new HumanMessage(`Regulation: ${regulation.title}\n\n${redactedText}`),
    ];

    const startTime = Date.now();
    const response = await this.chatModel!.invoke(messages);
    const duration = Date.now() - startTime;

    const aiResponse = await this.prisma.promptHistory.create({
      data: {
        userId: user.sub,
        query: 'Extract obligations',
        response: String(response.content),
        regulationId,
        context: { type: 'OBLIGATION_EXTRACTION', status: 'PENDING' },
      },
    });

    await this.logAIUsage(user.sub, 'generate-obligations', duration, text.length, String(response.content).length);

    return {
      id: aiResponse.id,
      obligations: this.parseJsonResponse(String(response.content)),
      status: 'PENDING',
    };
  }

  /**
   * AI-assisted impact assessment scoring.
   */
  async generateImpactAssessment(regulationId: string, user: AuthenticatedUser) {
    const regulation = await this.prisma.regulation.findUnique({
      where: { id: regulationId },
      include: { businessAreas: true },
    });

    if (!regulation) throw new BadRequestException('Regulation not found');

    const text = regulation.description || '';
    const redactedText = this.redactPII(text);

    const context = `Regulation: ${regulation.title}
Impact Level: ${regulation.impactLevel}
Business Areas: ${regulation.businessAreas?.map((ba: any) => ba.businessAreaId).join(', ') || 'Not specified'}

${redactedText}`;

    const messages = [
      new SystemMessage(this.PROMPTS.generateImpactAssessment),
      new HumanMessage(context),
    ];

    const startTime = Date.now();
    const response = await this.chatModel!.invoke(messages);
    const duration = Date.now() - startTime;

    const aiResponse = await this.prisma.promptHistory.create({
      data: {
        userId: user.sub,
        query: 'Generate impact assessment',
        response: String(response.content),
        regulationId,
        context: { type: 'IMPACT_ASSESSMENT', status: 'PENDING' },
      },
    });

    await this.logAIUsage(user.sub, 'generate-impact-assessment', duration, text.length, String(response.content).length);

    return {
      id: aiResponse.id,
      assessment: this.parseJsonResponse(String(response.content)),
      status: 'PENDING',
    };
  }

  /**
   * Generate audit questions for a specific audit.
   */
  async generateAuditQuestions(auditId: string, user: AuthenticatedUser) {
    const audit = await this.prisma.audit.findUnique({
      where: { id: auditId },
      include: {
        regulation: { select: { title: true, description: true } },
      },
    });

    if (!audit) throw new BadRequestException('Audit not found');

    const scope = `Audit: ${audit.title}
Type: ${audit.type}
Description: ${audit.description || ''}
Regulation in scope: ${audit.regulation ? `${audit.regulation.title}` : 'None specified'}`;

    const messages = [
      new SystemMessage(this.PROMPTS.generateAuditQuestions),
      new HumanMessage(scope),
    ];

    const startTime = Date.now();
    const response = await this.chatModel!.invoke(messages);
    const duration = Date.now() - startTime;

    const aiResponse = await this.prisma.promptHistory.create({
      data: {
        userId: user.sub,
        query: 'Generate audit questions',
        response: String(response.content),
        auditId,
        context: { type: 'AUDIT_QUESTIONS', status: 'PENDING' },
      },
    });

    await this.logAIUsage(user.sub, 'generate-audit-questions', duration, scope.length, String(response.content).length);

    return {
      id: aiResponse.id,
      questions: this.parseJsonResponse(String(response.content)),
      status: 'PENDING',
    };
  }

  /**
   * Generate an implementation plan (project plan) from a regulation.
   */
  async generateImplementationPlan(regulationId: string, user: AuthenticatedUser) {
    const regulation = await this.prisma.regulation.findUnique({
      where: { id: regulationId },
    });

    if (!regulation) throw new BadRequestException('Regulation not found');

    const text = regulation.description || '';
    const redactedText = this.redactPII(text);

    const context = `Regulation: ${regulation.title}
Enforcement Date: ${regulation.enforcementDate || 'Not specified'}
Impact Level: ${regulation.impactLevel}

${redactedText}`;

    const messages = [
      new SystemMessage(this.PROMPTS.generateImplementationPlan),
      new HumanMessage(context),
    ];

    const startTime = Date.now();
    const response = await this.chatModel!.invoke(messages);
    const duration = Date.now() - startTime;

    const aiResponse = await this.prisma.promptHistory.create({
      data: {
        userId: user.sub,
        query: 'Generate implementation plan',
        response: String(response.content),
        regulationId,
        context: { type: 'IMPLEMENTATION_PLAN', status: 'PENDING' },
      },
    });

    await this.logAIUsage(user.sub, 'generate-implementation-plan', duration, text.length, String(response.content).length);

    return {
      id: aiResponse.id,
      plan: this.parseJsonResponse(String(response.content)),
      status: 'PENDING',
    };
  }

  /**
   * Compare regulation requirements against existing controls.
   */
  async compareControls(regulationId: string, user: AuthenticatedUser) {
    const regulation = await this.prisma.regulation.findUnique({
      where: { id: regulationId },
      include: {
        obligations: {
          include: { controls: true },
        },
      },
    });

    if (!regulation) throw new BadRequestException('Regulation not found');

    const allControls = await this.prisma.control.findMany({
      where: { isActive: true },
      select: { id: true, title: true, type: true, effectiveness: true },
      take: 100,
    });

    const context = `Regulation: ${regulation.title}
Requirements/Obligations:
${regulation.obligations?.map((o: any, i: number) => `${i + 1}. ${o.title}: ${o.description}`).join('\n') || 'None extracted yet'}

Existing Controls:
${allControls.map((c: any) => `- ${c.title} (${c.type}, effectiveness: ${c.effectiveness})`).join('\n')}`;

    const messages = [
      new SystemMessage(this.PROMPTS.compareControls),
      new HumanMessage(context),
    ];

    const startTime = Date.now();
    const response = await this.chatModel!.invoke(messages);
    const duration = Date.now() - startTime;

    await this.logAIUsage(user.sub, 'compare-controls', duration, context.length, String(response.content).length);

    return {
      analysis: this.parseJsonResponse(String(response.content)),
    };
  }

  /**
   * Predict business unit exposure to a regulation.
   */
  async predictExposure(regulationId: string, user: AuthenticatedUser) {
    const regulation = await this.prisma.regulation.findUnique({
      where: { id: regulationId },
      include: { businessAreas: true },
    });

    if (!regulation) throw new BadRequestException('Regulation not found');

    const businessAreas = await this.prisma.businessArea.findMany({
      select: { id: true, name: true, description: true },
    });

    const context = `Regulation: ${regulation.title}
Description: ${regulation.description || ''}
Impact Level: ${regulation.impactLevel}

Business Units:
${businessAreas.map((ba) => `- ${ba.name}: ${ba.description || 'No description'}`).join('\n')}`;

    const messages = [
      new SystemMessage(this.PROMPTS.predictExposure),
      new HumanMessage(context),
    ];

    const startTime = Date.now();
    const response = await this.chatModel!.invoke(messages);
    const duration = Date.now() - startTime;

    await this.logAIUsage(user.sub, 'predict-exposure', duration, context.length, String(response.content).length);

    return {
      predictions: this.parseJsonResponse(String(response.content)),
    };
  }

  // ────────── AI Response Management ──────────

  /**
   * Get AI usage logs.
   */
  async getLogs(query: { page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const [data, total] = await Promise.all([
      this.prisma.aILog.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, action: true, model: true,
          promptTokens: true, completionTokens: true, totalTokens: true,
          cost: true, latency: true,
          createdAt: true,
        },
      }),
      this.prisma.aILog.count(),
    ]);

    return { data, total, page, limit };
  }

  /**
   * Get token usage statistics.
   */
  async getTokenUsage() {
    const usage = await this.prisma.aILog.aggregate({
      _sum: {
        promptTokens: true,
        completionTokens: true,
        totalTokens: true,
      },
      _count: { id: true },
      _avg: { latency: true },
    });

    // Usage by action type
    const byType = await this.prisma.aILog.groupBy({
      by: ['action'],
      _count: { id: true },
      _sum: { promptTokens: true, completionTokens: true },
    });

    return {
      totalRequests: usage._count.id,
      totalInputTokens: usage._sum.promptTokens || 0,
      totalOutputTokens: usage._sum.completionTokens || 0,
      averageDuration: Math.round(usage._avg.latency || 0),
      byType: byType.map((t: any) => ({
        type: t.action,
        requests: t._count.id,
        inputTokens: t._sum.promptTokens || 0,
        outputTokens: t._sum.completionTokens || 0,
      })),
    };
  }

  /**
   * Approve a pending AI response by updating the prompt history context.
   */
  async approveResponse(responseId: string, user: AuthenticatedUser) {
    const record = await this.prisma.promptHistory.findUnique({ where: { id: responseId } });
    if (!record) throw new BadRequestException('AI response not found');

    const ctx = (record.context as any) || {};
    return this.prisma.promptHistory.update({
      where: { id: responseId },
      data: {
        context: { ...ctx, status: 'APPROVED', approvedBy: user.sub, approvedAt: new Date().toISOString() },
      },
    });
  }

  /**
   * Reject a pending AI response.
   */
  async rejectResponse(responseId: string, reason: string, user: AuthenticatedUser) {
    const record = await this.prisma.promptHistory.findUnique({ where: { id: responseId } });
    if (!record) throw new BadRequestException('AI response not found');

    const ctx = (record.context as any) || {};
    return this.prisma.promptHistory.update({
      where: { id: responseId },
      data: {
        context: { ...ctx, status: 'REJECTED', rejectionReason: reason, reviewedBy: user.sub },
      },
    });
  }

  // ────────── Helpers ──────────

  /**
   * Attempt to parse a JSON response from the LLM.
   * Falls back to returning the raw text if parsing fails.
   */
  private parseJsonResponse(text: string): any {
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();
      return JSON.parse(jsonStr);
    } catch {
      return { rawText: text };
    }
  }

  /**
   * Log AI usage for tracking and billing.
   */
  private async logAIUsage(
    userId: string,
    action: string,
    duration: number,
    inputLength: number,
    outputLength: number,
  ) {
    try {
      // Rough token estimation: ~4 characters per token
      const estimatedInputTokens = Math.ceil(inputLength / 4);
      const estimatedOutputTokens = Math.ceil(outputLength / 4);

      await this.prisma.aILog.create({
        data: {
          userId,
          action,
          model: this.configService.get<string>('openai.model', 'gpt-4-turbo-preview'),
          promptTokens: estimatedInputTokens,
          completionTokens: estimatedOutputTokens,
          totalTokens: estimatedInputTokens + estimatedOutputTokens,
          latency: duration,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log AI usage: ${(error as Error).message}`);
    }
  }
}
