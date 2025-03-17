import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryRepository } from './category.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './category.schema';
import { CategoryController } from './category.controller';
import { Video, VideoSchema } from 'src/video/video.schema';
import { RabbitmqModule } from 'src/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: Video.name, schema: VideoSchema },
    ]),
    RabbitmqModule,
  ],
  providers: [CategoryService, CategoryRepository],
  controllers: [CategoryController],
  exports: [CategoryRepository],
})
export class CategoryModule {}
