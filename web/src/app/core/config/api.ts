import { environment } from '../../../environments/environment';

const base = environment.apiBase;

/** Every backend endpoint URL in one place, built from `environment.apiBase`. */
export const API = {
  auth: {
    login: `${base}/auth/login`,
    register: `${base}/auth/register`,
    me: `${base}/auth/me`,
  },
  content: {
    programs: `${base}/content/programs`,
    courses: (programId: string) => `${base}/content/programs/${programId}/courses`,
    publishProgram: (id: string) => `${base}/content/programs/${id}/publish`,
    publishCourse: (id: string) => `${base}/content/courses/${id}/publish`,
  },
  cohorts: {
    list: `${base}/cohorts`,
    enroll: (id: string) => `${base}/cohorts/${id}/enroll`,
  },
} as const;