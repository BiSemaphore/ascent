import { Inject, Injectable } from '@nestjs/common';
import { MONGO } from '../mongo/mongo.module';
import type { Db } from 'mongodb';

/** One entry in the audit/activity log (e.g. `user.registered`, `login.failed`). */
export interface ActivityEvent {
  type: string;
  userId?: string;
  email?: string;
  ip?: string;
  meta?: Record<string, unknown>;
}

/** Appends activity/audit entries to MongoDB. */
@Injectable()
export class ActivityService {
  constructor(@Inject(MONGO) private readonly mongo: Db) {}

  /** Append an activity entry, stamped with the current time. */
  async log(event: ActivityEvent) {
    await this.mongo
      .collection('activities')
      .insertOne({ ...event, at: new Date() });
  }
}
