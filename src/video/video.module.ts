import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { VideoRepository } from './video.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from './video.schema';
import { CategoryModule } from 'src/category/category.module';
import { CategoryRepository } from 'src/category/category.repository';
import { AuthModule } from 'src/auth/auth.module';
import { Category, CategorySchema } from 'src/category/category.schema';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { VideoChunksService } from './video-chunks.service';
import { RabbitmqModule } from 'src/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Video.name, schema: VideoSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    CategoryModule,
    AuthModule,
    CloudinaryModule,
    RabbitmqModule,
  ],
  controllers: [VideoController],
  providers: [
    VideoService,
    VideoRepository,
    CategoryRepository,
    VideoChunksService,
  ],
  exports: [VideoService, VideoRepository],
})
export class VideoModule {}
