import { randomUUID } from 'node:crypto';

export const TOPICS = {
  learnerEnrolled: 'learner.enrolled',
} as const;

export interface EventEnvelope<T> {
  eventId: string;
  eventType: string;
  version: number;
  occurredAt: string;
  correlationId: string;
  producer: string;
  payload: T;
}

export interface LearnerEnrolled {
  enrollmentId: string;
  cohortId: string;
  userId: string;
  programId: string;
  seatsRemaining: number;
}

export function createEvent<T>(params: {
  eventType: string;
  producer: string;
  payload: T;
  correlationId?: string;
}): EventEnvelope<T> {
  return {
    eventId: randomUUID(),
    eventType: params.eventType,
    version: 1,
    occurredAt: new Date().toISOString(),
    correlationId: params.correlationId ?? randomUUID(),
    producer: params.producer,
    payload: params.payload,
  };
}
