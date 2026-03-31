import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { ScanResultItemDto } from './dto/scan.dto';
import { RegulatorySourcesService, SourceCheckResult } from './regulatory-sources.service';

export interface ScanParams {
  countries?: string[];
  sectors?: string[];
  includeProposed?: boolean;
}

export interface ScanResult {
  newRegulations: ScanResultItemDto[];
  existingMatches: Array<ScanResultItemDto & { existingId: string }>;
  scannedCountries: string[];
  totalFound: number;
  scanDuration: number;
  sourcesChecked: SourceCheckResult[];
}

export interface ImportResult {
  imported: number;
  skipped: number;
  details: Array<{ title: string; id?: string; status: 'imported' | 'skipped'; reason?: string }>;
}

@Injectable()
export class HorizonScanningService {
  private readonly logger = new Logger(HorizonScanningService.name);
  private openai: OpenAI | null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly regulatorySources: RegulatorySourcesService,
  ) {
    const apiKey =
      this.configService.get<string>('openai.apiKey') ||
      this.configService.get<string>('OPENAI_API_KEY');

    if (apiKey && apiKey.length > 0) {
      this.openai = new OpenAI({ apiKey });
    } else {
      this.openai = null;
      this.logger.warn('OpenAI API key not configured — Horizon Scanning disabled');
    }
  }

  private ensureEnabled(): void {
    if (!this.openai) {
      throw new BadRequestException(
        'Horizon Scanning requires an OpenAI API key. Set OPENAI_API_KEY to enable.',
      );
    }
  }

  /**
   * Scan for new and upcoming regulatory changes.
   * Step 1: Fetch REAL data from official government RSS/API feeds
   * Step 2: Send real items to OpenAI for classification, impact assessment, and supplementation
   */
  async scanForRegulations(params: ScanParams): Promise<ScanResult> {
    this.ensureEnabled();

    const startTime = Date.now();

    // Resolve country codes
    let countryCodes: string[];
    if (!params.countries || params.countries.length === 0) {
      const allCountries = await this.prisma.country.findMany({
        where: { isActive: true },
        select: { code: true },
      });
      countryCodes = allCountries.map((c) => c.code);
    } else {
      countryCodes = params.countries;
    }

    // Resolve country names for the prompt
    const countryRecords = await this.prisma.country.findMany({
      where: { code: { in: countryCodes } },
      select: { code: true, name: true },
    });
    const countryNames = countryRecords.map((c) => `${c.name} (${c.code})`).join(', ');

    const sectors = params.sectors?.length
      ? params.sectors.join(', ')
      : 'all sectors including financial services, data protection, cybersecurity, employment, environmental, health & safety, AI governance, consumer protection, anti-money laundering, ESG';

    // ── Step 1: Fetch from real regulatory sources ──
    this.logger.log(`Fetching from real regulatory sources for: ${countryCodes.join(', ')}`);
    const { items: realItems, sourcesChecked } = await this.regulatorySources.fetchFromAllSources(countryCodes);
    this.logger.log(`Fetched ${realItems.length} real items from ${sourcesChecked.filter(s => s.status === 'success').length} sources`);

    // Format real items for the AI prompt (limit to 50 most recent to fit context)
    const feedContext = realItems.slice(0, 50).map((item, i) =>
      `${i + 1}. [${item.sourceName}] "${item.title}" (${item.date || 'no date'}) — ${item.summary || 'No summary'} | URL: ${item.url || 'N/A'}`
    ).join('\n');

    const prompt = `You are a senior regulatory intelligence analyst. I have fetched the following ${realItems.length} recent items from official government regulatory feeds and APIs:

--- BEGIN REAL REGULATORY FEED DATA ---
${feedContext || '(No items were fetched from feeds — some sources may have been unavailable)'}
--- END REAL REGULATORY FEED DATA ---

Sources checked: ${sourcesChecked.map(s => `${s.sourceName} (${s.status}, ${s.itemsFetched} items)`).join('; ')}

Your tasks:
1. From the REAL feed items above, identify which ones are significant regulatory changes (new laws, rules, amendments, consultations) relevant to: ${sectors}
2. Classify and structure each relevant item with impact assessment and key obligations
3. ALSO add any additional significant regulations you know about for ${countryNames} from 2024 onwards that were NOT in the feeds above

You MUST return a JSON object with a "regulations" key containing an array. Include 5-20 items. Prioritise items from the real feeds, and clearly mark any you add from your own knowledge.

Each item must have these exact fields:
{
  "title": "Official name of the legislation or regulation",
  "summary": "2-3 sentence description of what it requires and who it affects",
  "country": "Country name",
  "countryCode": "Two-letter ISO code e.g. GB, US, DE",
  "regulator": "Issuing regulatory body or authority",
  "category": "One of: Data Protection, Financial Services, Cybersecurity, Employment, Environmental, Health & Safety, AI Governance, Consumer Protection, Anti-Money Laundering, ESG, Corporate Governance, Tax",
  "status": "One of: PROPOSED, CONSULTATION, APPROVED, ENACTED, EFFECTIVE",
  "effectiveDate": "YYYY-MM-DD or null",
  "impactLevel": "One of: CRITICAL, HIGH, MEDIUM, LOW",
  "sourceUrl": "The real URL from the feed data if available, otherwise official source URL or null",
  "keyObligations": ["Obligation 1", "Obligation 2", "Obligation 3"],
  "isAmendment": false,
  "amendedLegislation": null
}

Return format: {"regulations": [...]}`;

    // ── Step 2: Send to OpenAI for classification ──
    const completion = await this.openai!.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'You are a regulatory intelligence analyst. Always respond with valid JSON containing a "regulations" array. Prioritise real data from feeds over your own knowledge.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 4096,
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    const duration = Date.now() - startTime;

    // Log AI usage
    const inputTokens = completion.usage?.prompt_tokens || Math.ceil(prompt.length / 4);
    const outputTokens = completion.usage?.completion_tokens || Math.ceil(responseText.length / 4);

    await this.logScan(
      'horizon-scan',
      duration,
      inputTokens,
      outputTokens,
      prompt,
      responseText,
    );

    // Parse the response — handle various shapes GPT might return
    let regulations: ScanResultItemDto[];
    try {
      const parsed = JSON.parse(responseText);
      if (Array.isArray(parsed)) {
        regulations = parsed;
      } else if (parsed.regulations && Array.isArray(parsed.regulations)) {
        regulations = parsed.regulations;
      } else if (parsed.results && Array.isArray(parsed.results)) {
        regulations = parsed.results;
      } else {
        // Try to find any array in the top-level keys
        const arrayKey = Object.keys(parsed).find((k) => Array.isArray(parsed[k]));
        regulations = arrayKey ? parsed[arrayKey] : [];
      }
      this.logger.log(`Parsed ${regulations.length} regulations from OpenAI response`);
    } catch (error) {
      this.logger.error(`Failed to parse OpenAI response: ${(error as Error).message}`);
      this.logger.error(`Raw response: ${responseText.substring(0, 500)}`);
      throw new BadRequestException('Failed to parse AI response. Please try again.');
    }

    // Filter out proposed if not requested
    if (params.includeProposed === false) {
      regulations = regulations.filter(
        (r) => !['PROPOSED', 'CONSULTATION'].includes(r.status),
      );
    }

    // Check for existing matches in the database
    const newRegulations: ScanResultItemDto[] = [];
    const existingMatches: Array<ScanResultItemDto & { existingId: string }> = [];

    for (const reg of regulations) {
      const existing = await this.prisma.regulation.findFirst({
        where: {
          title: {
            contains: reg.title,
            mode: 'insensitive',
          },
        },
        select: { id: true },
      });

      if (existing) {
        existingMatches.push({ ...reg, existingId: existing.id });
      } else {
        newRegulations.push(reg);
      }
    }

    return {
      newRegulations,
      existingMatches,
      scannedCountries: countryCodes,
      totalFound: regulations.length,
      scanDuration: duration,
      sourcesChecked,
    };
  }

  /**
   * Import selected scan results into the regulations table.
   */
  async importScanResults(
    results: ScanResultItemDto[],
    user: AuthenticatedUser,
  ): Promise<ImportResult> {
    const details: ImportResult['details'] = [];
    let imported = 0;
    let skipped = 0;

    // Find the actual user in DB (dev mode uses a fake sub)
    let ownerId = user.sub;
    const dbUser = await this.prisma.user.findFirst({
      where: { email: { contains: 'admin', mode: 'insensitive' } },
      select: { id: true },
    });
    if (dbUser) ownerId = dbUser.id;

    for (const item of results) {
      try {
        // Look up country by code
        const country = await this.prisma.country.findFirst({
          where: { code: { equals: item.countryCode, mode: 'insensitive' } },
        });

        if (!country) {
          skipped++;
          details.push({
            title: item.title,
            status: 'skipped',
            reason: `Country not found for code: ${item.countryCode}`,
          });
          continue;
        }

        // Look up category by name (case-insensitive)
        const category = await this.prisma.category.findFirst({
          where: { name: { equals: item.category, mode: 'insensitive' } },
        });

        // Generate slug from title
        const slug = this.generateSlug(item.title);

        // Check slug uniqueness
        const existingSlug = await this.prisma.regulation.findUnique({
          where: { slug },
        });

        if (existingSlug) {
          skipped++;
          details.push({
            title: item.title,
            status: 'skipped',
            reason: 'Regulation with this slug already exists',
          });
          continue;
        }

        // Map status
        const statusMap: Record<string, string> = {
          PROPOSED: 'PROPOSED',
          CONSULTATION: 'CONSULTATION',
          APPROVED: 'APPROVED',
          ENACTED: 'ENACTED',
          EFFECTIVE: 'EFFECTIVE',
        };

        const impactMap: Record<string, string> = {
          CRITICAL: 'CRITICAL',
          HIGH: 'HIGH',
          MEDIUM: 'MEDIUM',
          LOW: 'LOW',
        };

        const regulation = await this.prisma.regulation.create({
          data: {
            title: item.title,
            slug,
            summary: item.summary,
            description: item.keyObligations?.join('\n\n') || null,
            countryId: country.id,
            categoryId: category?.id || null,
            sourceUrl: item.sourceUrl || null,
            lifecycleStage: 'IDENTIFICATION',
            status: (statusMap[item.status] as any) || 'DRAFT',
            impactLevel: (impactMap[item.impactLevel] as any) || null,
            effectiveDate: item.effectiveDate ? new Date(item.effectiveDate) : null,
            ownerId,
            keywords: [item.category, item.regulator].filter(Boolean),
            metadata: {
              source: 'horizon-scan',
              isAmendment: item.isAmendment,
              amendedLegislation: item.amendedLegislation,
              regulator: item.regulator,
              keyObligations: item.keyObligations,
              importedAt: new Date().toISOString(),
            },
          },
        });

        imported++;
        details.push({
          title: item.title,
          id: regulation.id,
          status: 'imported',
        });
      } catch (error) {
        skipped++;
        details.push({
          title: item.title,
          status: 'skipped',
          reason: (error as Error).message,
        });
        this.logger.error(`Failed to import regulation "${item.title}": ${(error as Error).message}`);
      }
    }

    return { imported, skipped, details };
  }

  /**
   * Get history of horizon scanning operations from AI logs.
   */
  async getScanHistory(): Promise<any[]> {
    const logs = await this.prisma.aILog.findMany({
      where: { action: 'horizon-scan' },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        action: true,
        model: true,
        promptTokens: true,
        completionTokens: true,
        totalTokens: true,
        latency: true,
        metadata: true,
        createdAt: true,
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    return logs;
  }

  // ────────── Helpers ──────────

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 200)
      .replace(/^-+|-+$/g, '');
  }

  private async logScan(
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
}
