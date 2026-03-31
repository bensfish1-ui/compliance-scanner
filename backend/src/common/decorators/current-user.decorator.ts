import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extract the current authenticated user from the request.
 * Usage: @CurrentUser() user: AuthenticatedUser
 * Usage: @CurrentUser('sub') userId: string
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);

/**
 * Represents the authenticated user from Cognito JWT.
 */
export interface AuthenticatedUser {
  sub: string;
  email: string;
  name: string;
  roles: string[];
  organizationId: string;
  tenantId: string;
  cognitoGroups: string[];
}
