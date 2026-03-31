import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { CognitoAuthGuard } from '../auth/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Search')
@ApiBearerAuth('bearer')
@UseGuards(CognitoAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Full-text search across all entities' })
  @ApiQuery({ name: 'q', type: String, description: 'Search query' })
  @ApiQuery({ name: 'entityTypes', required: false, type: String, description: 'Comma-separated entity types' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  async search(
    @Query('q') q: string,
    @Query('entityTypes') entityTypes?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('category') category?: string,
  ) {
    const filters: Record<string, any> = {};
    if (status) filters.status = status;
    if (category) filters.category = category;

    return this.searchService.search(q, {
      entityTypes: entityTypes?.split(','),
      page: page || 1,
      limit: limit || 20,
      filters,
    });
  }

  @Get('autocomplete')
  @ApiOperation({ summary: 'Autocomplete suggestions' })
  @ApiQuery({ name: 'q', type: String })
  @ApiQuery({ name: 'entityType', required: false, type: String })
  async autocomplete(
    @Query('q') q: string,
    @Query('entityType') entityType?: string,
  ) {
    return this.searchService.autocomplete(q, entityType);
  }

  @Post('reindex')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Trigger full reindex of all data' })
  async reindex() {
    return this.searchService.reindexAll();
  }
}
