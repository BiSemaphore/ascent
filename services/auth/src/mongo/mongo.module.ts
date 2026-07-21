import { Global, Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoClient } from 'mongodb';

export const MONGO = Symbol('MONGO');
export const MONGO_CLIENT = Symbol('MONGO_CLIENT');

@Global()
@Module({
  providers: [
    {
      provide: MONGO_CLIENT,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const client = new MongoClient(
          config.getOrThrow<string>('MONGODB_URL'),
        );
        await client.connect();
        return client;
      },
    },
    {
      provide: MONGO,
      inject: [MONGO_CLIENT, ConfigService],
      useFactory: (client: MongoClient, config: ConfigService) =>
        client.db(config.getOrThrow<string>('MONGODB_DB')),
    },
  ],
  exports: [MONGO],
})
export class MongoModule implements OnModuleDestroy {
  constructor(@Inject(MONGO_CLIENT) private readonly client: MongoClient) {}

  async onModuleDestroy() {
    await this.client.close();
  }
}
