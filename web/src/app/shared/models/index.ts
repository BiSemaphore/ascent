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

export interface CreateCohortDto {
  programId: string;
  title: string;
  startDate: string;
  seatLimit: number;
}

export interface CreateProgramDto {
  title: string;
  description?: string;
}

export interface EnrollResult {
  seatsRemaining: number;
  full: boolean;
}

export interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export interface PageRequest {
  page: number;
  size: number;
  sort?: string;
  search?: string;
}

export interface PageResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}
