import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

export interface RegulatorySource {
  id: string;
  name: string;
  country: string;
  type: 'api' | 'rss' | 'atom';
  url: string;
  description: string;
}

export interface RawRegItem {
  title: string;
  summary: string;
  url: string;
  date: string | null;
  sourceName: string;
  sourceCountry: string;
  sourceId: string;
}

export interface SourceCheckResult {
  sourceId: string;
  sourceName: string;
  country: string;
  status: 'success' | 'error' | 'timeout' | 'skipped';
  itemsFetched: number;
  error?: string;
  durationMs: number;
}

const REGULATORY_SOURCES: RegulatorySource[] = [
  // UK - Core
  {
    id: 'uk-legislation',
    name: 'UK Legislation.gov.uk',
    country: 'GB',
    type: 'atom',
    url: 'https://www.legislation.gov.uk/new/data.feed',
    description: 'Official UK legislation feed - new Acts and Statutory Instruments',
  },
  {
    id: 'uk-fca',
    name: 'UK FCA News',
    country: 'GB',
    type: 'rss',
    url: 'https://www.fca.org.uk/news/rss.xml',
    description: 'Financial Conduct Authority news and regulatory updates',
  },
  {
    id: 'uk-ico',
    name: 'UK ICO News',
    country: 'GB',
    type: 'rss',
    url: 'https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/feed/',
    description: 'Information Commissioner regulatory updates',
  },
  // UK - Healthcare / Optical
  {
    id: 'uk-goc',
    name: 'General Optical Council',
    country: 'GB',
    type: 'rss',
    url: 'https://optical.org/en/news-and-publications/news/feed/',
    description: 'GOC regulatory news, fitness to practise, standards updates',
  },
  {
    id: 'uk-cqc',
    name: 'Care Quality Commission',
    country: 'GB',
    type: 'rss',
    url: 'https://www.cqc.org.uk/news/rss',
    description: 'CQC inspections, guidance, and regulatory updates',
  },
  {
    id: 'uk-mhra',
    name: 'MHRA Medical Devices',
    country: 'GB',
    type: 'rss',
    url: 'https://www.gov.uk/government/organisations/medicines-and-healthcare-products-regulatory-agency.atom',
    description: 'MHRA medical device alerts, guidance, regulation changes',
  },
  {
    id: 'uk-hse',
    name: 'Health & Safety Executive',
    country: 'GB',
    type: 'rss',
    url: 'https://www.hse.gov.uk/news/rss/hse-news.xml',
    description: 'HSE workplace health and safety updates',
  },
  {
    id: 'uk-asa',
    name: 'Advertising Standards Authority',
    country: 'GB',
    type: 'rss',
    url: 'https://www.asa.org.uk/feeds/rulings-feed.xml',
    description: 'ASA rulings and advertising guidance',
  },
  {
    id: 'uk-cma',
    name: 'Competition & Markets Authority',
    country: 'GB',
    type: 'atom',
    url: 'https://www.gov.uk/government/organisations/competition-and-markets-authority.atom',
    description: 'CMA competition and consumer protection enforcement',
  },
  {
    id: 'uk-env-agency',
    name: 'Environment Agency',
    country: 'GB',
    type: 'atom',
    url: 'https://www.gov.uk/government/organisations/environment-agency.atom',
    description: 'Environmental regulation, waste, pollution',
  },
  {
    id: 'uk-nhs-england',
    name: 'NHS England',
    country: 'GB',
    type: 'rss',
    url: 'https://www.england.nhs.uk/feed/',
    description: 'NHS commissioning, policy, service changes',
  },
  {
    id: 'uk-gov-legislation',
    name: 'UK Gov Legislation Updates',
    country: 'GB',
    type: 'atom',
    url: 'https://www.gov.uk/search/policy-papers-and-consultations.atom?content_store_document_type=open_consultations',
    description: 'UK government open consultations and policy papers',
  },
  // EU
  {
    id: 'eu-eurlex',
    name: 'EUR-Lex Recent Acts',
    country: 'EU',
    type: 'rss',
    url: 'https://eur-lex.europa.eu/EN/display-feed.html?rssId=actsInForce',
    description: 'EU Official Journal - recent regulations and directives',
  },
  {
    id: 'eu-eba',
    name: 'European Banking Authority',
    country: 'EU',
    type: 'rss',
    url: 'https://www.eba.europa.eu/rss-feeds',
    description: 'EBA regulatory and policy updates',
  },
  {
    id: 'eu-edpb',
    name: 'European Data Protection Board',
    country: 'EU',
    type: 'rss',
    url: 'https://www.edpb.europa.eu/rss_en',
    description: 'EDPB guidelines, opinions, and enforcement',
  },
  // Ireland
  {
    id: 'ie-cbi',
    name: 'Central Bank of Ireland',
    country: 'IE',
    type: 'rss',
    url: 'https://www.centralbank.ie/rss',
    description: 'Central Bank of Ireland regulatory updates',
  },
  {
    id: 'ie-dpc',
    name: 'Ireland Data Protection Commission',
    country: 'IE',
    type: 'rss',
    url: 'https://www.dataprotection.ie/news-media/latest-news/rss.xml',
    description: 'Irish DPC enforcement and guidance',
  },
  // Australia
  {
    id: 'au-apra',
    name: 'Australian APRA',
    country: 'AU',
    type: 'rss',
    url: 'https://www.apra.gov.au/rss.xml',
    description: 'Australian Prudential Regulation Authority updates',
  },
  {
    id: 'au-tga',
    name: 'Therapeutic Goods Administration',
    country: 'AU',
    type: 'rss',
    url: 'https://www.tga.gov.au/news/rss.xml',
    description: 'TGA medical device and therapeutic goods updates',
  },
  {
    id: 'au-accc',
    name: 'ACCC Consumer Protection',
    country: 'AU',
    type: 'rss',
    url: 'https://www.accc.gov.au/rss',
    description: 'Australian consumer protection enforcement',
  },
  // New Zealand
  {
    id: 'nz-medsafe',
    name: 'Medsafe NZ',
    country: 'NZ',
    type: 'rss',
    url: 'https://www.medsafe.govt.nz/RSS/SafetyInfo.xml',
    description: 'NZ medical device and medicines safety',
  },
  {
    id: 'nz-legislation',
    name: 'NZ Legislation',
    country: 'NZ',
    type: 'atom',
    url: 'https://legislation.govt.nz/subscribe/atom',
    description: 'New Zealand new legislation feed',
  },
  // Netherlands
  {
    id: 'nl-igj',
    name: 'Dutch Healthcare Inspectorate',
    country: 'NL',
    type: 'rss',
    url: 'https://www.igj.nl/actueel/rss',
    description: 'IGJ healthcare inspection and enforcement',
  },
  // Canada
  {
    id: 'ca-gazette',
    name: 'Canada Gazette Part II',
    country: 'CA',
    type: 'rss',
    url: 'https://canadagazette.gc.ca/rss/part2-eng.xml',
    description: 'Canadian regulatory gazette - statutory orders and regulations',
  },
  // Guernsey
  {
    id: 'gg-gfsc',
    name: 'Guernsey Financial Services Commission',
    country: 'GG',
    type: 'rss',
    url: 'https://www.gfsc.gg/news/rss',
    description: 'GFSC insurance and financial services regulation',
  },
];

@Injectable()
export class RegulatorySourcesService {
  private readonly logger = new Logger(RegulatorySourcesService.name);
  private readonly xmlParser: XMLParser;

  constructor() {
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
  }

  /** Get all available regulatory sources, optionally filtered by country codes. */
  getSources(countryCodes?: string[]): RegulatorySource[] {
    if (!countryCodes || countryCodes.length === 0) {
      return REGULATORY_SOURCES;
    }
    return REGULATORY_SOURCES.filter((s) => countryCodes.includes(s.country));
  }

  /** Fetch from all sources for given countries. */
  async fetchFromAllSources(countryCodes: string[]): Promise<{
    items: RawRegItem[];
    sourcesChecked: SourceCheckResult[];
  }> {
    const sources = this.getSources(countryCodes);
    const allItems: RawRegItem[] = [];
    const sourcesChecked: SourceCheckResult[] = [];

    // Fetch all sources in parallel
    const results = await Promise.allSettled(
      sources.map(async (source) => {
        const start = Date.now();
        try {
          const items = await this.fetchFromSource(source);
          const duration = Date.now() - start;
          sourcesChecked.push({
            sourceId: source.id,
            sourceName: source.name,
            country: source.country,
            status: 'success',
            itemsFetched: items.length,
            durationMs: duration,
          });
          return items;
        } catch (error: any) {
          const duration = Date.now() - start;
          const isTimeout = error.code === 'ECONNABORTED' || duration >= 10000;
          sourcesChecked.push({
            sourceId: source.id,
            sourceName: source.name,
            country: source.country,
            status: isTimeout ? 'timeout' : 'error',
            itemsFetched: 0,
            error: error.message?.substring(0, 200),
            durationMs: duration,
          });
          return [];
        }
      }),
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        allItems.push(...result.value);
      }
    }

    this.logger.log(
      `Fetched ${allItems.length} items from ${sourcesChecked.filter((s) => s.status === 'success').length}/${sources.length} sources`,
    );

    return { items: allItems, sourcesChecked };
  }

  /** Fetch real data from a single regulatory source. */
  async fetchFromSource(source: RegulatorySource): Promise<RawRegItem[]> {
    this.logger.debug(`Fetching from ${source.name} (${source.url})`);

    const response = await axios.get(source.url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'ComplianceScanner/1.0 (Regulatory Monitoring)',
        Accept: source.type === 'api' ? 'application/json' : 'application/xml, text/xml, application/rss+xml, application/atom+xml, */*',
      },
      // Don't throw on non-2xx for feeds that sometimes return weird statuses
      validateStatus: (status) => status < 500,
    });

    if (!response.data) return [];

    // US Federal Register returns JSON
    if (source.id === 'us-federal-register') {
      return this.parseFederalRegister(response.data, source);
    }

    // Everything else is XML (RSS or Atom)
    const data = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    return this.parseXmlFeed(data, source);
  }

  /** Parse US Federal Register JSON API response. */
  private parseFederalRegister(data: any, source: RegulatorySource): RawRegItem[] {
    const results = data?.results || [];
    return results.slice(0, 20).map((item: any) => ({
      title: item.title || 'Untitled',
      summary: this.truncate(item.abstract || item.title || '', 500),
      url: item.html_url || item.pdf_url || '',
      date: item.publication_date || item.effective_on || null,
      sourceName: source.name,
      sourceCountry: source.country,
      sourceId: source.id,
    }));
  }

  /** Parse RSS or Atom XML feed. */
  private parseXmlFeed(xml: string, source: RegulatorySource): RawRegItem[] {
    try {
      const parsed = this.xmlParser.parse(xml);
      const items: RawRegItem[] = [];

      // Try RSS format: rss > channel > item
      const rssItems = parsed?.rss?.channel?.item;
      if (rssItems) {
        const arr = Array.isArray(rssItems) ? rssItems : [rssItems];
        for (const item of arr.slice(0, 20)) {
          items.push({
            title: this.extractText(item.title) || 'Untitled',
            summary: this.truncate(this.stripHtml(this.extractText(item.description) || ''), 500),
            url: this.extractText(item.link) || '',
            date: this.extractText(item.pubDate) || null,
            sourceName: source.name,
            sourceCountry: source.country,
            sourceId: source.id,
          });
        }
        return items;
      }

      // Try Atom format: feed > entry
      const atomEntries = parsed?.feed?.entry;
      if (atomEntries) {
        const arr = Array.isArray(atomEntries) ? atomEntries : [atomEntries];
        for (const entry of arr.slice(0, 20)) {
          const link = Array.isArray(entry.link)
            ? entry.link.find((l: any) => l['@_rel'] === 'alternate')?.['@_href'] || entry.link[0]?.['@_href']
            : entry.link?.['@_href'] || entry.link;

          items.push({
            title: this.extractText(entry.title) || 'Untitled',
            summary: this.truncate(this.stripHtml(this.extractText(entry.summary || entry.content) || ''), 500),
            url: typeof link === 'string' ? link : '',
            date: this.extractText(entry.updated || entry.published) || null,
            sourceName: source.name,
            sourceCountry: source.country,
            sourceId: source.id,
          });
        }
        return items;
      }

      this.logger.debug(`No RSS/Atom items found in ${source.name} response`);
      return [];
    } catch (error) {
      this.logger.warn(`Failed to parse XML from ${source.name}: ${(error as Error).message}`);
      return [];
    }
  }

  private extractText(val: any): string {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && val['#text']) return val['#text'];
    return String(val);
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
  }

  private truncate(text: string, maxLen: number): string {
    if (text.length <= maxLen) return text;
    return text.substring(0, maxLen).replace(/\s+\S*$/, '') + '...';
  }
}
