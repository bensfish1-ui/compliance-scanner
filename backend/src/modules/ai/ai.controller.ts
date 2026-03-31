import {
  Controller, Get, Post, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { CognitoAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('AI')
@ApiBearerAuth('bearer')
@UseGuards(CognitoAuthGuard, RolesGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Conversational AI assistant for compliance queries' })
  async chat(
    @Body('message') message: string,
    @Body('history') history: Array<{ role: string; content: string }>,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.aiService.chat(message, history || [], user);
  }

  @Post('analyze-regulation')
  @Roles('ADMIN', 'COMPLIANCE_OFFICER')
  @ApiOperation({ summary: 'AI analysis of regulation text (obligations, impact, summary)' })
  async analyzeRegulation(
    @Body('regulationId') regulationId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.aiService.analyzeRegulation(regulationId, user);
  }

  @Post('generate-summary')
  @ApiOperation({ summary: 'Generate an executive summary of a regulation' })
  async generateSummary(
    @Body('regulationId') regulationId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.aiService.generateSummary(regulationId, user);
  }

  @Post('generate-obligations')
  @Roles('ADMIN', 'COMPLIANCE_OFFICER')
  @ApiOperation({ summary: 'Extract obligations from regulation text' })
  async generateObligations(
    @Body('regulationId') regulationId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.aiService.generateObligations(regulationId, user);
  }

  @Post('generate-impact-assessment')
  @Roles('ADMIN', 'COMPLIANCE_OFFICER')
  @ApiOperation({ summary: 'AI-assisted impact assessment scoring' })
  async generateImpactAssessment(
    @Body('regulationId') regulationId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.aiService.generateImpactAssessment(regulationId, user);
  }

  @Post('generate-audit-questions')
  @Roles('ADMIN', 'COMPLIANCE_OFFICER', 'AUDITOR')
  @ApiOperation({ summary: 'Generate audit questions for an audit' })
  async generateAuditQuestions(
    @Body('auditId') auditId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.aiService.generateAuditQuestions(auditId, user);
  }

  @Post('generate-implementation-plan')
  @Roles('ADMIN', 'COMPLIANCE_OFFICER')
  @ApiOperation({ summary: 'Generate implementation project plan from regulation' })
  async generateImplementationPlan(
    @Body('regulationId') regulationId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.aiService.generateImplementationPlan(regulationId, user);
  }

  @Post('compare-controls')
  @ApiOperation({ summary: 'Compare regulation requirements against existing controls' })
  async compareControls(
    @Body('regulationId') regulationId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.aiService.compareControls(regulationId, user);
  }

  @Post('predict-exposure')
  @ApiOperation({ summary: 'Predict business unit exposure to a regulation' })
  async predictExposure(
    @Body('regulationId') regulationId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.aiService.predictExposure(regulationId, user);
  }

  @Get('logs')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get AI usage logs' })
  async getLogs(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.aiService.getLogs({ page, limit });
  }

  @Get('token-usage')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get AI token usage statistics' })
  async getTokenUsage() {
    return this.aiService.getTokenUsage();
  }

  @Post('responses/:id/approve')
  @Roles('ADMIN', 'COMPLIANCE_OFFICER')
  @ApiOperation({ summary: 'Approve a pending AI response (human-in-the-loop)' })
  async approveResponse(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.aiService.approveResponse(id, user);
  }

  @Post('responses/:id/reject')
  @Roles('ADMIN', 'COMPLIANCE_OFFICER')
  @ApiOperation({ summary: 'Reject a pending AI response' })
  async rejectResponse(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.aiService.rejectResponse(id, reason, user);
  }
}
