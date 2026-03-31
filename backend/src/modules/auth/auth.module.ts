import { Module, Global, Logger } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CognitoAuthGuard } from './auth.guard';

const logger = new Logger('AuthModule');

/**
 * Only register the Cognito Passport strategy when user pool is configured.
 * In dev mode without Cognito, CognitoAuthGuard bypasses auth automatically.
 */
const conditionalProviders = {
  provide: 'COGNITO_STRATEGY',
  useFactory: (configService: ConfigService) => {
    const poolId = configService.get<string>('AWS_COGNITO_USER_POOL_ID');
    if (poolId && poolId.length > 0) {
      // Dynamically require to avoid crashing when Cognito isn't configured
      const { CognitoStrategy } = require('./strategies/cognito.strategy');
      return new CognitoStrategy(configService);
    }
    logger.warn('Cognito not configured — running with dev auth bypass');
    return null;
  },
  inject: [ConfigService],
};

@Global()
@Module({
  imports: [PassportModule.register({ defaultStrategy: 'cognito' })],
  controllers: [AuthController],
  providers: [AuthService, CognitoAuthGuard, conditionalProviders],
  exports: [AuthService, CognitoAuthGuard],
})
export class AuthModule {}
