import { Kafka, logLevel } from 'kafkajs';
import { ensureTopic } from './ensure-topic.mjs';

const kafka = new Kafka({
  clientId: 'demo-producer',
  brokers: ['localhost:29092'],
  logLevel: logLevel.NOTHING,
});

const TOPIC = 'demo.enrollments';
const COHORTS = ['cohort-alpha', 'cohort-bravo', 'cohort-charlie'];

async function main() {
  await ensureTopic(kafka, TOPIC, 3);

  const producer = kafka.producer();
  await producer.connect();

  for (let i = 1; i <= 9; i++) {
    const key = COHORTS[i % COHORTS.length];
    const event = {
      eventType: 'LearnerEnrolled',
      learner: `learner-${i}`,
      cohort: key,
      at: new Date().toISOString(),
    };
    const [meta] = await producer.send({
      topic: TOPIC,
      messages: [{ key, value: JSON.stringify(event) }],
    });
    console.log(
      `sent key=${key.padEnd(15)} -> partition ${meta.partition}  offset ${meta.baseOffset}`,
    );
  }

  await producer.disconnect();
  console.log(
    '\nSame key always lands in the same partition. That is how Kafka keeps per-key ordering.',
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
