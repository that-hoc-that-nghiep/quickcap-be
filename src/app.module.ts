import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskModule } from './task/task.module';
import {
  CacheInterceptor,
  CacheModule,
  CacheStore,
} from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { VideoModule } from './video/video.module';
import { CategoryModule } from './category/category.module';
import { CommentModule } from './comment/comment.module';
import { ReportModule } from './report/report.module';
import { InviteModule } from './invite/invite.module';
import { MediaModule } from './media/media.module';
import { ConversationModule } from './conversation/conversation.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.DATABASE_URL),
    TaskModule,
    VideoModule,
    CategoryModule,
    CommentModule,
    ReportModule,
    InviteModule,
    MediaModule,
    ConversationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
