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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URL'),
      }),
      inject: [ConfigService],
    }),
    VideoModule,
    CategoryModule,
    CommentModule,
    ReportModule,
    InviteModule,
    MediaModule,
    ConversationModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
