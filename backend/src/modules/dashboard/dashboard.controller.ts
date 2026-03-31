import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { CognitoAuthGuard } from '../auth/auth.guard';

@ApiTags('Dashboard')
@ApiBearerAuth('bearer')
@UseGuards(CognitoAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get dashboard summary cards data' })
  async getSummary() {
    return this.service.getSummary();
  }

  @Get('upcoming-regulations')
  @ApiOperation({ summary: 'Get regulations with deadlines in next 90 days' })
  async getUpcomingRegulations() {
    return this.service.getUpcomingRegulations();
  }

  @Get('overdue-actions')
  @ApiOperation({ summary: 'Get overdue tasks and actions' })
  async getOverdueActions() {
    return this.service.getOverdueActions();
  }

  @Get('compliance-maturity')
  @ApiOperation({ summary: 'Get overall compliance maturity score and breakdown' })
  async getComplianceMaturity() {
    return this.service.getComplianceMaturity();
  }

  @Get('risk-heatmap')
  @ApiOperation({ summary: 'Get risk heatmap data for visualization' })
  async getRiskHeatmap() {
    return this.service.getRiskHeatmap();
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get 12-month trend data' })
  async getTrends() {
    return this.service.getTrends();
  }

  @Get('kpis')
  @ApiOperation({ summary: 'Get KPI widget data' })
  async getKPIs() {
    return this.service.getKPIs();
  }

  @Get('top-risks')
  @ApiOperation({ summary: 'Get top 10 risks by inherent score' })
  async getTopRisks() {
    return this.service.getTopRisks();
  }

  @Get('country-overview')
  @ApiOperation({ summary: 'Get regulations grouped by country' })
  async getCountryOverview() {
    return this.service.getCountryOverview();
  }

  @Get('business-area-overview')
  @ApiOperation({ summary: 'Get overview by business area' })
  async getBusinessAreaOverview() {
    return this.service.getBusinessAreaOverview();
  }

  @Get('ai-usage')
  @ApiOperation({ summary: 'Get AI token usage, costs, and trends' })
  async getAIUsage() {
    return this.service.getAIUsage();
  }
}
