import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KAFKA_CLIENT, KafkaPublisher } from './kafka.publisher';

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
              clientId: 'cohort',
              brokers: config.getOrThrow<string>('KAFKA_BROKERS').split(','),
            },
          },
        }),
      },
    ]),
  ],
  providers: [KafkaPublisher],
  exports: [KafkaPublisher],
})
export class KafkaModule {}
