import { Controller, Get, Post, Query, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CognitoAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Reports')
@ApiBearerAuth('bearer')
@UseGuards(CognitoAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Post('board-report')
  @Roles('ADMIN', 'COMPLIANCE_OFFICER')
  @ApiOperation({ summary: 'Generate board compliance report (PDF)' })
  async generateBoardReport() {
    return this.service.generateBoardReport();
  }

  @Post('monthly-report')
  @Roles('ADMIN', 'COMPLIANCE_OFFICER')
  @ApiOperation({ summary: 'Generate monthly compliance report (Excel)' })
  async generateMonthlyReport() {
    return this.service.generateMonthlyReport();
  }

  @Post('csv-export/:entityType')
  @ApiOperation({ summary: 'Export entity data as CSV' })
  async generateCsvExport(@Param('entityType') entityType: string) {
    return this.service.generateCsvExport(entityType);
  }

  @Post('country-report/:countryId')
  @Roles('ADMIN', 'COMPLIANCE_OFFICER')
  @ApiOperation({ summary: 'Generate country-specific compliance report (PDF)' })
  async generateCountryReport(@Param('countryId', ParseUUIDPipe) countryId: string) {
    return this.service.generateCountryReport(countryId);
  }

  @Post('audit-readiness/:auditId')
  @Roles('ADMIN', 'COMPLIANCE_OFFICER', 'AUDITOR')
  @ApiOperation({ summary: 'Generate audit readiness report (PDF)' })
  async generateAuditReadinessReport(@Param('auditId', ParseUUIDPipe) auditId: string) {
    return this.service.generateAuditReadinessReport(auditId);
  }
}
