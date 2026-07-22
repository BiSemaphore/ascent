/** The three account roles across the platform. */
export type Role = 'learner' | 'instructor' | 'admin';

/** Every role, in ascending order of privilege. */
export const ROLES: readonly Role[] = ['learner', 'instructor', 'admin'];
