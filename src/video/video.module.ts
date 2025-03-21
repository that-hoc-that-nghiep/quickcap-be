import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from './video.schema';
import { VideoRepository } from './video.repository';
import { CategoryModule } from 'src/category/category.module';
import { AuthModule } from 'src/auth/auth.module';
import { RabbitmqModule } from 'src/rabbitmq/rabbitmq.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Video.name,
        schema: VideoSchema,
      },
    ]),
    CategoryModule,
    AuthModule,
    RabbitmqModule,
    CloudinaryModule,
  ],
  controllers: [VideoController],
  providers: [VideoService, VideoRepository],
  exports: [VideoService, VideoRepository],
})
export class VideoModule {}
