import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './task.schema';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  CacheInterceptor,
  CacheModule,
  CacheStore,
} from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { APP_INTERCEPTOR } from '@nestjs/core';
@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => {
        const store = await redisStore({
          socket: {
            host: `${process.env.REDIS_HOST}` || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379,
          },
          username: `${process.env.REDIS_USERNAME}` || '',
          password: `${process.env.REDIS_PASSWORD}` || '',
        });

        return {
          store: store as unknown as CacheStore,
          ttl: 1 * 60000, // 3 minutes (milliseconds)
        };
      },
    }),
    ClientsModule.register([
      {
        name: 'TEST_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [`${process.env.RABBITMQ_URL}`],
          queue: 'demo_queue',
        },
      },
    ]),
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
  ],
  providers: [
    TaskService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
  controllers: [TaskController],
})
export class TaskModule {}
