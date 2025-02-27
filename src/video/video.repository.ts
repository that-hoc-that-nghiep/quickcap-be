import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Video } from './video.schema';
import { Model } from 'mongoose';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';

@Injectable()
export class VideoRepository {
  constructor(@InjectModel(Video.name) private videoModel: Model<Video>) {}

  async createVideo(
    userId: string,
    orgId: string,
    source: string,
    createVideoDto: CreateVideoDto,
  ): Promise<Video> {
    const { title, description, summary, categoryId } = createVideoDto;
    console.log('data from create video dto', createVideoDto);
    const video = await this.videoModel.create({
      title,
      description,
      source,
      userId,
      orgId,
      summary,
      categoryId,
    });
    return video.populate('categoryId');
  }

  async getAllVideos(
    orgId: string,
    limit: number,
    page: number,
    keyword?: string,
  ): Promise<{
    videos: Video[];
    total: number;
  }> {
    const filter: Record<string, any> = {
      orgId: { $in: [orgId] },
    };
    if (keyword) {
      filter.title = { $regex: keyword, $options: 'i' };
    }
    const skip = (page - 1) * limit;
    const videos = await this.videoModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .exec();
    const total = await this.videoModel.countDocuments(filter).exec();
    return { videos, total };
  }

  async getVideoById(id: string): Promise<Video> {
    const video = await this.videoModel
      .findById(id)
      .populate('categoryId')
      .exec();
    if (!video) throw new NotFoundException(`Video id ${id} not found`);
    return video;
  }

  async updateVideo(id: string, updateVideoDto: UpdateVideoDto) {
    const updatedVideo = await this.videoModel.findByIdAndUpdate(
      id,
      { $set: updateVideoDto },
      {
        new: true,
        runValidators: true,
      },
    );
    return await updatedVideo.populate('categoryId');
  }

  async deleteVideo(id: string) {
    const video = await this.videoModel.findByIdAndDelete(id).exec();
    if (!video) throw new NotFoundException(`Video id ${id} not found`);
    return video;
  }
}
