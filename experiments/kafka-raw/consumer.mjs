import { Kafka, logLevel } from 'kafkajs';
import { ensureTopic } from './ensure-topic.mjs';

const kafka = new Kafka({
  clientId: 'demo-consumer',
  brokers: ['localhost:29092'],
  logLevel: logLevel.NOTHING,
});

const TOPIC = 'demo.enrollments';
const groupId = process.env.GROUP_ID ?? 'progress-service';

async function main() {
  await ensureTopic(kafka, TOPIC, 3);

  const consumer = kafka.consumer({ groupId });
  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC, fromBeginning: true });

  console.log(`consumer group "${groupId}" listening on ${TOPIC}...\n`);

  await consumer.run({
    eachMessage: async ({ partition, message }) => {
      const event = JSON.parse(message.value.toString());
      console.log(
        `partition ${partition}  offset ${String(message.offset).padStart(3)}  ` +
          `key=${message.key?.toString().padEnd(15)} ${event.eventType} ${event.learner}`,
      );
    },
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
