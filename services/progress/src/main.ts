import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Kafka } from 'kafkajs';
import { TOPICS } from '@ascent/contracts';
import { AppModule } from './app.module';

async function ensureTopics(brokers: string[]) {
  const admin = new Kafka({ clientId: 'progress-admin', brokers }).admin();
  await admin.connect();
  const existing = await admin.listTopics();
  const wanted = [TOPICS.learnerEnrolled, TOPICS.lessonCompleted].filter(
    (t) => !existing.includes(t),
  );
  if (wanted.length > 0) {
    await admin.createTopics({
      topics: wanted.map((topic) => ({
        topic,
        numPartitions: 3,
        replicationFactor: 1,
      })),
    });
  }
  await admin.disconnect();
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = app.get(ConfigService);
  const brokers = config.getOrThrow<string>('KAFKA_BROKERS').split(',');

  await ensureTopics(brokers);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: { clientId: 'progress', brokers },
      consumer: { groupId: 'progress-service' },
    },
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Ascent Progress')
    .setDescription('Per-learner progress, projected from events')
    .setVersion('0.3.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup(
    'docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  await app.startAllMicroservices();

  const port = config.get<number>('PORT') ?? 3004;
  await app.listen(port);
  console.log(`Progress service listening on http://localhost:${port}, consuming learner.enrolled`);
}
bootstrap();
