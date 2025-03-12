import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    const { title, description, transcript, categoryId } = createVideoDto;
    console.log('data from create video dto', createVideoDto);
    const video = await this.videoModel.create({
      title,
      description,
      source,
      userId,
      orgId,
      transcript,
      categoryId,
    });
    return video.populate('categoryId');
  }
  async createVideoWithoutTranscript(
    userId: string,
    orgId: string,
    source: string,
  ): Promise<Video> {
    const video = await this.videoModel.create({
      source,
      userId,
      orgId,
    });
    return video;
  }

  async getAllVideos(
    orgId: string,
    limit: number,
    page: number,
    keyword?: string,
    categoryId?: string,
  ): Promise<{
    videos: Video[];
    total: number;
  }> {
    const filter: Record<string, any> = {
      orgId: { $in: [orgId] },
    };
    if (keyword && keyword.trim() !== '') {
      filter.title = { $regex: keyword, $options: 'i' };
    }

    if (categoryId && categoryId.trim() !== '') {
      filter.categoryId = { $in: [categoryId] };
    }
    const skip = (page - 1) * limit;
    const videos = await this.videoModel
      .find(filter)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate('categoryId')
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

  async getVideosByCategoryId(categoryId: string): Promise<Video[]> {
    const videos = await this.videoModel.find({ categoryId }).exec();
    return videos;
  }

  async getVideosByOrgId(orgId: string): Promise<Video[]> {
    const videos = await this.videoModel
      .find({ orgId: { $in: [orgId] } })
      .exec();
    return videos;
  }

  async checkVideoOwner(userId: string, videoId: string): Promise<Video> {
    const video = await this.videoModel.findById(videoId);
    if (!video) throw new NotFoundException(`Video id ${videoId} not found`);
    const videoOwner = await this.videoModel.exists({
      _id: videoId,
      userId: userId,
    });
    if (!videoOwner)
      throw new BadRequestException(
        `You are not the owner of video id ${videoId}`,
      );
    return video;
  }

  async getUniqueVideosInOrg(
    orgIdToInclude: string,
    orgIdExclude: string,
  ): Promise<Video[]> {
    const excludedVideoIds = await this.videoModel
      .find({ orgId: { $in: [orgIdExclude] } })
      .select('_id')
      .exec();

    const uniqueVideos = await this.videoModel.find({
      orgId: { $in: [orgIdToInclude] },
      _id: { $nin: excludedVideoIds },
    });
    return uniqueVideos;
  }

  async updateVideoOrgId(videoId: string, orgId: string) {
    const video = await this.videoModel.findById(videoId);
    if (!video) throw new NotFoundException(`Video id ${videoId} not found`);
    const updateVideo = await this.videoModel.findByIdAndUpdate(
      videoId,
      {
        $addToSet: { orgId },
      },
      {
        new: true,
        runValidators: true,
      },
    );
    return updateVideo;
  }

  async removeVideoFromOrg(videoId: string, orgId: string) {
    const video = await this.getVideoById(videoId);
    if (!video.orgId.includes(orgId)) {
      throw new BadRequestException(
        `OrgId ${orgId} does not exist in videoId ${videoId}`,
      );
    }
    const updateVideo = await this.videoModel.findByIdAndUpdate(
      videoId,
      {
        $pull: { orgId: orgId },
      },
      {
        new: true,
        runValidators: true,
      },
    );
    return updateVideo;
  }

  async updateVideoNSFW(videoId: string, isNSFW: boolean, nsfwType: string) {
    const video = await this.videoModel.findById(videoId);
    if (!video) throw new NotFoundException(`Video id ${videoId} not found`);
    const updateVideo = await this.videoModel.findByIdAndUpdate(
      videoId,
      {
        $set: { isNSFW, nsfwType },
      },
      {
        new: true,
        runValidators: true,
      },
    );
    return updateVideo;
  }
}
