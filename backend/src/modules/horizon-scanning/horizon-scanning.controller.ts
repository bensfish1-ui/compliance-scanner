import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { HorizonScanningService } from './horizon-scanning.service';
import { RegulatorySourcesService } from './regulatory-sources.service';
import { ScanRequestDto, ImportScanResultDto } from './dto/scan.dto';
import { CognitoAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Horizon Scanning')
@ApiBearerAuth('bearer')
@UseGuards(CognitoAuthGuard, RolesGuard)
@Controller('horizon-scanning')
export class HorizonScanningController {
  constructor(
    private readonly horizonScanningService: HorizonScanningService,
    private readonly regulatorySourcesService: RegulatorySourcesService,
  ) {}

  @Post('scan')
  @Roles('ADMIN', 'COMPLIANCE_OFFICER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Scan for new and upcoming regulatory changes',
    description:
      'Uses OpenAI to identify recent and upcoming regulatory changes across specified countries and sectors. Returns results split into new regulations not yet tracked and existing matches already in the database.',
  })
  @ApiResponse({ status: 200, description: 'Scan results with new and existing regulations' })
  @ApiResponse({ status: 400, description: 'OpenAI API key not configured or invalid request' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async scan(@Body() dto: ScanRequestDto) {
    return this.horizonScanningService.scanForRegulations({
      countries: dto.countries,
      sectors: dto.sectors,
      includeProposed: dto.includeProposed,
    });
  }

  @Post('import')
  @Roles('ADMIN', 'COMPLIANCE_OFFICER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Import selected scan results into the regulations database',
    description:
      'Takes selected regulation items from a horizon scan and creates regulation records in the database with IDENTIFICATION lifecycle stage.',
  })
  @ApiResponse({ status: 200, description: 'Import results with counts and details' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async importResults(
    @Body() dto: ImportScanResultDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.horizonScanningService.importScanResults(dto.regulations, user);
  }

  @Get('history')
  @ApiOperation({
    summary: 'Get horizon scanning history',
    description: 'Returns the history of past horizon scans from the AI log.',
  })
  @ApiResponse({ status: 200, description: 'List of past scan operations' })
  async getHistory() {
    return this.horizonScanningService.getScanHistory();
  }

  @Get('sources')
  @ApiOperation({
    summary: 'Get list of all regulatory sources',
    description: 'Returns the full list of regulatory feeds and APIs that are checked during horizon scanning.',
  })
  @ApiResponse({ status: 200, description: 'List of regulatory sources' })
  async getSources() {
    return this.regulatorySourcesService.getSources();
  }
}
