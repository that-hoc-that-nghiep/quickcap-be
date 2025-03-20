import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { VideoModule } from './video/video.module';
import { CategoryModule } from './category/category.module';
import { CommentModule } from './comment/comment.module';
import { ReportModule } from './report/report.module';
import { InviteModule } from './invite/invite.module';
import { MediaModule } from './media/media.module';
import { ConversationModule } from './conversation/conversation.module';
import { AuthModule } from './auth/auth.module';
import * as Joi from 'joi';
import { EnvVariables } from './constants';
import { GlobalCacheModule } from './global-module/cache.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        DATABASE_LOCAL_URL: Joi.string().required(),
        PORT: Joi.number().required(),
        API_DOCS_URL: Joi.string().required(),
        API_DOC_USERNAME: Joi.string().required(),
        API_DOC_PASSWORD: Joi.string().required(),
        RABBITMQ_URL: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
        REDIS_USERNAME: Joi.string().required(),
        REDIS_PASSWORD: Joi.string().required(),
        ACCESS_KEY: Joi.string().required(),
        SECRET_KEY: Joi.string().required(),
        BUCKET_REGION: Joi.string().required(),
        BUCKET_NAME: Joi.string().required(),
        MAILER_HOST: Joi.string().required(),
        MAILER_PORT: Joi.number().required(),
        MAILER_EMAIL: Joi.string().required(),
        MAILER_PASSWORD: Joi.string().required(),
        AUTH_URL: Joi.string().required(),
        QUEUE_NAME: Joi.string().required(),
        QUEUE_NAME_2: Joi.string().required(),
        CLOUDINARY_NAME: Joi.string().required(),
        CLOUDINARY_API_KEY: Joi.string().required(),
        CLOUDINARY_API_SECRET: Joi.string().required(),
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>(EnvVariables.DATABASE_URL),
      }),
      inject: [ConfigService],
    }),
    GlobalCacheModule,
    VideoModule,
    CategoryModule,
    CommentModule,
    ReportModule,
    InviteModule,
    MediaModule,
    ConversationModule,
    AuthModule,
    CloudinaryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
