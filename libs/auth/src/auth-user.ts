import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import type { Role } from './role';

/** The authenticated caller, as decoded from a verified JWT. */
export interface AuthUser {
  userId: string;
  email: string;
  role: Role;
}

/**
 * Route parameter decorator that returns the {@link AuthUser} the JWT strategy
 * placed on the request. Use on routes behind {@link JwtAuthGuard}.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser =>
    ctx.switchToHttp().getRequest<{ user: AuthUser }>().user,
);
