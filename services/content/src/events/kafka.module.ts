import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KAFKA_CLIENT, KafkaPublisher } from './kafka.publisher';
import { OutboxRelay } from './outbox.relay';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: KAFKA_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'content',
              brokers: config.getOrThrow<string>('KAFKA_BROKERS').split(','),
            },
            producerOnlyMode: true,
          },
        }),
      },
    ]),
  ],
  providers: [KafkaPublisher, OutboxRelay],
  exports: [KafkaPublisher],
})
export class KafkaModule {}
