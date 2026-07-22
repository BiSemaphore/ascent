import { randomUUID } from 'node:crypto';

/** Kafka topic names, one per domain event (past-tense, dot-namespaced). */
export const TOPICS = {
  learnerEnrolled: 'learner.enrolled',
  lessonCompleted: 'lesson.completed',
} as const;

/**
 * The standard wrapper around every domain event. Carries delivery/tracing
 * metadata alongside the domain-specific `payload`.
 */
export interface EventEnvelope<T> {
  /** Unique id for this event; consumers dedup on it (idempotency). */
  eventId: string;
  /** Logical event name, e.g. `LearnerEnrolled`. */
  eventType: string;
  /** Schema version of the payload. */
  version: number;
  /** ISO timestamp of when the event occurred. */
  occurredAt: string;
  /** Correlates events that belong to the same causal flow. */
  correlationId: string;
  /** Service that produced the event, e.g. `cohort`. */
  producer: string;
  /** The domain-specific event data. */
  payload: T;
}

/** Emitted by Cohort when a learner is enrolled into a cohort. */
export interface LearnerEnrolled {
  enrollmentId: string;
  cohortId: string;
  userId: string;
  programId: string;
  seatsRemaining: number;
}

/** Emitted by Content when a learner completes a lesson. */
export interface LessonCompleted {
  lessonId: string;
  programId: string;
  userId: string;
}

/**
 * Build an {@link EventEnvelope} with generated `eventId`/`occurredAt` and a
 * default `correlationId` when none is supplied.
 *
 * @param params.eventType - logical event name (`LearnerEnrolled`, ...)
 * @param params.producer - the emitting service's name
 * @param params.payload - the domain event data
 * @param params.correlationId - optional id to tie this into an existing flow
 * @returns a fully populated event envelope ready to publish
 */
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
