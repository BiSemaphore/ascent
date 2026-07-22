import { SetMetadata } from '@nestjs/common';
import type { Role } from './role';

/** Metadata key under which {@link Roles} stores the allowed roles. */
export const ROLES_KEY = 'roles';

/**
 * Restrict a route (or controller) to the given roles. Enforced by
 * {@link RolesGuard}; a route with no `@Roles` allows any authenticated user.
 * @param roles - the roles permitted to call the handler
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
