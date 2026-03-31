import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@opensearch-project/opensearch';

/**
 * OpenSearch integration service for full-text search across all entities.
 * Manages index creation, document indexing, and search queries.
 */
@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private client: Client;
  private readonly indexPrefix: string;

  constructor(private readonly configService: ConfigService) {
    this.indexPrefix = this.configService.get<string>('opensearch.indexPrefix', 'compliance');

    this.client = new Client({
      node: this.configService.get<string>('opensearch.node', 'http://localhost:9200'),
      auth: {
        username: this.configService.get<string>('opensearch.username', 'admin'),
        password: this.configService.get<string>('opensearch.password', 'admin'),
      },
      ssl: { rejectUnauthorized: false },
    });
  }

  async onModuleInit() {
    try {
      // Verify connection
      const health = await this.client.cluster.health({});
      this.logger.log(`OpenSearch cluster: ${health.body.cluster_name}, status: ${health.body.status}`);

      // Ensure indices exist
      await this.createIndicesIfNotExist();
    } catch (error) {
      this.logger.warn(`OpenSearch connection failed: ${(error as Error).message}. Search features will be unavailable.`);
    }
  }

  /**
   * Create search indices with appropriate mappings.
   */
  private async createIndicesIfNotExist() {
    const indices = ['regulations', 'policies', 'risks', 'controls', 'obligations', 'documents'];

    for (const indexName of indices) {
      const fullIndex = `${this.indexPrefix}-${indexName}`;
      try {
        const exists = await this.client.indices.exists({ index: fullIndex });
        if (!exists.body) {
          await this.client.indices.create({
            index: fullIndex,
            body: {
              settings: {
                number_of_shards: 1,
                number_of_replicas: 0,
                analysis: {
                  analyzer: {
                    compliance_analyzer: {
                      type: 'custom',
                      tokenizer: 'standard',
                      filter: ['lowercase', 'stop', 'snowball'],
                    },
                  },
                },
              },
              mappings: {
                properties: {
                  title: { type: 'text', analyzer: 'compliance_analyzer', fields: { keyword: { type: 'keyword' } } },
                  description: { type: 'text', analyzer: 'compliance_analyzer' },
                  content: { type: 'text', analyzer: 'compliance_analyzer' },
                  referenceCode: { type: 'keyword' },
                  status: { type: 'keyword' },
                  category: { type: 'keyword' },
                  tags: { type: 'keyword' },
                  entityType: { type: 'keyword' },
                  entityId: { type: 'keyword' },
                  createdAt: { type: 'date' },
                  updatedAt: { type: 'date' },
                  suggest: {
                    type: 'completion',
                    analyzer: 'simple',
                  },
                },
              },
            },
          });
          this.logger.log(`Created index: ${fullIndex}`);
        }
      } catch (error) {
        this.logger.error(`Failed to create index ${fullIndex}: ${(error as Error).message}`);
      }
    }
  }

  /**
   * Index a document in OpenSearch.
   */
  async indexDocument(entityType: string, entityId: string, data: Record<string, any>) {
    const indexName = `${this.indexPrefix}-${entityType.toLowerCase()}s`;

    try {
      await this.client.index({
        index: indexName,
        id: entityId,
        body: {
          ...data,
          entityType,
          entityId,
          suggest: {
            input: [data.title, data.referenceCode].filter(Boolean),
          },
          indexedAt: new Date().toISOString(),
        },
        refresh: true,
      });
    } catch (error) {
      this.logger.error(`Failed to index document ${entityType}/${entityId}: ${(error as Error).message}`);
    }
  }

  /**
   * Remove a document from the search index.
   */
  async removeDocument(entityType: string, entityId: string) {
    const indexName = `${this.indexPrefix}-${entityType.toLowerCase()}s`;

    try {
      await this.client.delete({
        index: indexName,
        id: entityId,
        refresh: true,
      });
    } catch (error) {
      this.logger.error(`Failed to remove document: ${(error as Error).message}`);
    }
  }

  /**
   * Full-text search across all indices.
   * Returns results from multiple entity types, ranked by relevance.
   */
  async search(query: string, options?: {
    entityTypes?: string[];
    page?: number;
    limit?: number;
    filters?: Record<string, any>;
  }) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const from = (page - 1) * limit;

    // Determine which indices to search
    const targetIndices = options?.entityTypes?.length
      ? options.entityTypes.map((t) => `${this.indexPrefix}-${t.toLowerCase()}s`)
      : `${this.indexPrefix}-*`;

    const must: any[] = [
      {
        multi_match: {
          query,
          fields: ['title^3', 'referenceCode^2', 'description', 'content'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      },
    ];

    // Apply additional filters
    const filterClauses: any[] = [];
    if (options?.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        if (value !== undefined && value !== null) {
          filterClauses.push({ term: { [key]: value } });
        }
      }
    }

    try {
      const response = await this.client.search({
        index: targetIndices,
        body: {
          from,
          size: limit,
          query: {
            bool: {
              must,
              filter: filterClauses,
            },
          },
          highlight: {
            fields: {
              title: {},
              description: {},
              content: { fragment_size: 200 },
            },
          },
          aggs: {
            by_entity_type: {
              terms: { field: 'entityType' },
            },
            by_status: {
              terms: { field: 'status' },
            },
            by_category: {
              terms: { field: 'category' },
            },
          },
        },
      });

      const hits = response.body.hits;
      const aggregations = response.body.aggregations;

      return {
        results: hits.hits.map((hit: any) => ({
          id: hit._id,
          entityType: hit._source.entityType,
          score: hit._score,
          source: hit._source,
          highlights: hit.highlight,
        })),
        total: hits.total?.value || 0,
        page,
        limit,
        facets: {
          entityTypes: aggregations?.by_entity_type?.buckets || [],
          statuses: aggregations?.by_status?.buckets || [],
          categories: aggregations?.by_category?.buckets || [],
        },
      };
    } catch (error) {
      this.logger.error(`Search failed: ${(error as Error).message}`);
      return { results: [], total: 0, page, limit, facets: {} };
    }
  }

  /**
   * Autocomplete suggestions based on partial input.
   */
  async autocomplete(prefix: string, entityType?: string) {
    const indexName = entityType
      ? `${this.indexPrefix}-${entityType.toLowerCase()}s`
      : `${this.indexPrefix}-*`;

    try {
      const response = await this.client.search({
        index: indexName,
        body: {
          suggest: {
            title_suggest: {
              prefix,
              completion: {
                field: 'suggest',
                size: 10,
                fuzzy: { fuzziness: 'AUTO' },
              },
            },
          },
        },
      });

      const suggestions = response.body.suggest?.title_suggest?.[0]?.options || [];
      return suggestions.map((s: any) => ({
        text: s.text,
        score: s._score,
        entityType: s._source?.entityType,
        entityId: s._source?.entityId,
      }));
    } catch (error) {
      this.logger.error(`Autocomplete failed: ${(error as Error).message}`);
      return [];
    }
  }

  /**
   * Re-index all data from the database. Used for initial setup or recovery.
   */
  async reindexAll() {
    this.logger.log('Starting full reindex...');
    // This would be called from a background job
    // Implementation would iterate through all entities and index them
    return { message: 'Reindex queued', status: 'STARTED' };
  }
}
