export type Role = 'learner' | 'instructor' | 'admin';

export interface AuthUser {
  userId: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  accessToken: string;
  user: { id: string; email: string; role: Role };
}

export interface Program {
  id: string;
  title: string;
  description: string | null;
  published: boolean;
  createdAt: string;
}

export interface Cohort {
  id: string;
  programId: string;
  title: string;
  startDate: string;
  seatLimit: number;
  seatsTaken: number;
  seatsRemaining: number;
  full: boolean;
  createdAt: string;
}

export interface CreateCohort {
  programId: string;
  title: string;
  startDate: string;
  seatLimit: number;
}
