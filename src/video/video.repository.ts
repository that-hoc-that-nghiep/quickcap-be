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
import { UserApp } from 'src/constants/user';
import { OrderVideo, VideoAdds } from 'src/constants/video';

@Injectable()
export class VideoRepository {
  constructor(@InjectModel(Video.name) private videoModel: Model<Video>) {}

  async createVideo(
    user: UserApp,
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
      user,
      orgId,
      transcript,
      categoryId,
    });
    return video.populate('categoryId');
  }
  async createVideoWithoutTranscript(
    user: UserApp,
    orgId: string,
    source: string,
    categoryId: string[],
    isNSFW?: boolean,
  ): Promise<Video> {
    const video = await this.videoModel.create({
      source,
      user: user,
      orgId,
      categoryId,
      isNSFW,
    });
    return video;
  }

  async getAllVideos(
    orgId: string,
    limit: number,
    page: number,
    keyword?: string,
    categoryId?: string,
    order: OrderVideo = OrderVideo.DESC,
  ): Promise<{
    videos: Video[];
    total: number;
  }> {
    const filter: Record<string, any> = {
      orgId: { $in: [orgId] },
    };
    if (keyword && keyword.trim() !== '') {
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (categoryId && categoryId.trim() !== '') {
      filter.categoryId = { $in: [categoryId] };
    }
    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;
    const videos = await this.videoModel
      .find(filter)
      .sort({ createdAt: sortOrder })
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

  async addCategoryToVideo(videoId: string, categoryId: string[]) {
    const video = await this.videoModel.findByIdAndUpdate(
      videoId,
      {
        $addToSet: {
          categoryId: { $each: categoryId },
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );
    return await video.populate('categoryId');
  }

  async removeCategoryFromVideo(videoId: string, categoryId: string[]) {
    const video = await this.videoModel.findByIdAndUpdate(
      videoId,
      {
        $pull: {
          categoryId: { $in: categoryId },
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );
    return await video.populate('categoryId');
  }

  async deleteVideo(id: string) {
    const video = await this.videoModel
      .findByIdAndUpdate(
        id,
        {
          $set: { isDeleted: true },
        },
        {
          new: true,
        },
      )
      .exec();
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

  async updateVideoOrgIdsCategoryIds(
    videoId: string,
    orgIds: string[],
    categoryIds: string[],
  ) {
    const video = await this.videoModel.findById(videoId);
    if (!video) throw new NotFoundException(`Video id ${videoId} not found`);
    const updateVideo = await this.videoModel.findByIdAndUpdate(
      videoId,
      {
        $addToSet: {
          orgId: { $each: orgIds },
          categoryId: { $each: categoryIds },
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );
    return updateVideo;
  }

  async removeVideoFromOrg(
    videoId: string,
    orgId: string,
    categoryIds: string[],
  ) {
    const video = await this.getVideoById(videoId);
    if (!video.orgId.includes(orgId)) {
      throw new BadRequestException(
        `OrgId ${orgId} does not exist in videoId ${videoId}`,
      );
    }
    await this.removeCategoryFromVideo(videoId, categoryIds);
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

  async AddVideoToOrg(videoAdds: VideoAdds[]) {
    const bulkOps = videoAdds.map((v) => ({
      updateOne: {
        filter: { _id: v.videoId },
        update: {
          $addToSet: { orgId: v.orgId, categoryId: v.categoryId },
        },
      },
    }));

    await this.videoModel.bulkWrite(bulkOps);
    const updatedVideos = await this.videoModel.find({
      _id: { $in: videoAdds.map((v) => v.videoId) },
    });
    return updatedVideos;
  }

  async getVideosByOrgIdAndCategoryId(orgId: string, categoryId: string) {
    const videos = await this.videoModel
      .find({ categoryId: { $in: [categoryId] } })
      .populate({
        path: 'categoryId',
        match: { orgId: orgId },
        select: '_id name orgId',
      })
      .exec();

    return videos.filter((video) => video.categoryId !== null);
  }

  async getAnalyticsVideosByOrgId(orgId: string) {
    const videos = await this.videoModel.find({ orgId }).exec();
 
    const validVideos = videos.filter(
      (video) => !video.isDeleted && !video.isNSFW,
    );

    const totalVideo = validVideos.length;
    const totalLike = validVideos.reduce(
      (total, video) => total + video.like,
      0,
    );
    const totalView = validVideos.reduce(
      (total, video) => total + video.views,
      0,
    );
    return {
      totalVideo,
      totalLike,
      totalView,
    };
  }

  async uploadThumbnail(videoId: string, url: string) {
    const updateVideo = await this.videoModel.findByIdAndUpdate(
      videoId,
      {
        $set: { thumbnail: url },
      },
      {
        new: true,
        runValidators: true,
      },
    );
    return updateVideo;
  }
}
