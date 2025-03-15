import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VideoCategory } from './video_category.schema';

@Injectable()
export class VideoCategoryRepository {
  constructor(
    @InjectModel(VideoCategory.name)
    private videoCategoryModel: Model<VideoCategory>,
  ) {}
}
