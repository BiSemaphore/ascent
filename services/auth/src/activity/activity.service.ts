import { Inject, Injectable } from '@nestjs/common';
import { MONGO } from '../mongo/mongo.module';
import type { Db } from 'mongodb';

export interface ActivityEvent {
  type: string;
  userId?: string;
  email?: string;
  ip?: string;
  meta?: Record<string, unknown>;
}

@Injectable()
export class ActivityService {
  constructor(@Inject(MONGO) private readonly mongo: Db) {}

  async log(event: ActivityEvent) {
    await this.mongo
      .collection('activities')
      .insertOne({ ...event, at: new Date() });
  }
}
