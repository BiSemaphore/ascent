# kafka-raw

Raw `kafkajs` producer/consumer, to feel Kafka mechanics before we adopt the
NestJS transport. Runs on the host against the broker's external listener
(`localhost:29092`). Bring Kafka up first: `npm run stack:up`.

## Run

Two terminals:

```bash
# terminal 1 - start the consumer, then leave it running
npm run consume -w experiments/kafka-raw

# terminal 2 - send 9 enrollment events
npm run produce -w experiments/kafka-raw
```

## What to watch for

1. **Partitioning by key.** The producer keys each message by cohort. The same
   key always prints the same partition, that is how Kafka keeps per-key ordering
   without ordering the whole topic.
2. **Offsets.** Each partition has its own increasing offset. Offsets are
   per-partition, not global.
3. **Consumer groups (resume vs replay).** Stop the consumer and start it again
   with the *same* group: it resumes after the last committed offset and does not
   re-read. Start it with a *new* group and it replays from the beginning:
   ```bash
   GROUP_ID=another-service npm run consume -w experiments/kafka-raw
   ```
4. **Scaling vs fan-out.**
   - Two consumers in the *same* group split the partitions between them (scale
     out; each message handled once).
   - Two consumers in *different* groups each get every message (fan-out). This is
     how Progress, Gamification, and Notification will all react to the same
     `LearnerEnrolled` event independently.

Delivery here is **at-least-once**: a consumer can see a message again after a
crash before it commits, which is why real consumers must be idempotent.
