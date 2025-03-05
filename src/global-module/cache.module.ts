import { Module, Global, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { EnvVariables } from '../constants';
import {
  CacheInterceptor,
  CacheModule,
  CacheStore,
} from '@nestjs/cache-manager';
const logger = new Logger('RedisCache');
@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const store = await redisStore({
          socket: {
            host: configService.get<string>(EnvVariables.REDIS_HOST),
            port: configService.get<number>(EnvVariables.REDIS_PORT),
          },
          username: configService.get<string>(EnvVariables.REDIS_USERNAME),
          password: configService.get<string>(EnvVariables.REDIS_PASSWORD),
        });

        return {
          store: {
            get: async (key) => {
              const value = await store.get(key);
              if (value) {
                logger.log(`🔹 Cache HIT: ${key}`);
              } else {
                logger.log(`⚠️ Cache MISS: ${key}`);
              }
              return value;
            },
            set: async (key, value, options) => {
              const ttlInSeconds = 5;

              logger.log(`✅ Cache SET: ${key}, TTL: ${ttlInSeconds} seconds`);

              const client = (store as any).client;
              await client.set(key, JSON.stringify(value), {
                EX: ttlInSeconds,
              });

              return value;
            },

            del: async (key) => {
              return store.del(key);
            },

            reset: async () => {
              return store.reset();
            },
          } as unknown as CacheStore,
          ttl: 5000,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [CacheInterceptor],
  exports: [CacheModule, CacheInterceptor],
})
export class GlobalCacheModule {}
