import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

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
