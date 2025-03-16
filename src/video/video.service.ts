import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { VideoRepository } from './video.repository';
import { CategoryRepository } from 'src/category/category.repository';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import { UpdateVideoDto } from './dto/update-video.dto';
import { AuthService } from 'src/auth/auth.service';
import { EnvVariables } from 'src/constants';
import { User, UserApp, UserPermission } from 'src/constants/user';
import { OrgType } from 'src/constants/org';
import { RabbitmqService } from 'src/rabbitmq/rabbitmq.service';
import { VideoDataRes } from './dto/video-data.res';
import { TranscribeRes } from './dto/transcibe.res';
import {
  convertS3Url,
  extractS3Path,
  removeVietnameseAccents,
} from 'src/utlis';

import { ResultNSFWRes } from './dto/result-nsfw.res';

import { firstValueFrom } from 'rxjs';
import { VideoAdds } from 'src/constants/video';

interface VideoTemp {
  source: string;
  user: UserApp;
  orgId: string;
  title: string;
  description: string;
  transcript: string;
  categoryId: string[];
  s3Url: string;
}
@Injectable()
export class VideoService {
  constructor(
    private authService: AuthService,
    private videoRepository: VideoRepository,
    private categoryRepository: CategoryRepository,
    private configService: ConfigService,
    public readonly rabbitmqService: RabbitmqService,
  ) {}
  private readonly logger = new Logger(VideoService.name);
  private readonly s3 = new S3Client({
    credentials: {
      accessKeyId: this.configService.get<string>(EnvVariables.ACCESS_KEY),
      secretAccessKey: this.configService.get<string>(EnvVariables.SECRET_KEY),
    },
    region: this.configService.get<string>(EnvVariables.BUCKET_REGION),
  });

  async uploadVideo(user: User, orgId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const sanitizedFileName = removeVietnameseAccents(file.originalname);
    const Key: string = `${uuid()}-${sanitizedFileName}`;
    const Bucket = this.configService.get<string>(EnvVariables.BUCKET_NAME);
    const ContentType = file.mimetype;
    const command = new PutObjectCommand({
      Bucket,
      Key,
      Body: file.buffer,
      ContentType,
    });

    const fileStatus = await this.s3.send(command);
    if (fileStatus.$metadata.httpStatusCode === 200) {
      this.logger.log(`File uploaded s3 successfully ${Key}`);
      return await this.processVideoData(user, orgId, Key);
    }
  }

  async getAllVideos(
    user: User,
    orgId: string,
    limit: number,
    page: number,
    keyword?: string,
    categoryId?: string,
  ) {
    if (!this.authService.isUserInOrg(user, orgId)) {
      throw new UnauthorizedException('User is not in the organization');
    }
    const videos = await this.videoRepository.getAllVideos(
      orgId,
      limit,
      page,
      keyword,
      categoryId,
    );
    return { data: videos, message: 'Videos fetched successfully' };
  }

  async getVideoById(user: User, id: string) {
    const video = await this.videoRepository.getVideoById(id);
    const res = { data: video, message: 'Video fetched successfully' };
    if (
      user.id === video.user.id ||
      this.authService.isUserInVideoOrg(user, video.orgId)
    ) {
      return res;
    }
    throw new UnauthorizedException(
      'You are not allowed to access this video. Only the creator or user in the organization can access the video.',
    );
  }

  async getVideosUnique(orgIdPersonal: string, orgIdTranfer: string) {
    const videos = await this.videoRepository.getUniqueVideosInOrg(
      orgIdPersonal,
      orgIdTranfer,
    );
    return { data: videos, message: 'Videos fetched successfully' };
  }

  async updateVideo(
    userId: string,
    id: string,
    updateVideoDto: UpdateVideoDto,
  ) {
    const { categoryId } = updateVideoDto;
    await this.categoryRepository.getCategoryByArrayId(categoryId);
    const video = await this.videoRepository.getVideoById(id);
    if (video.user.id !== userId)
      throw new InternalServerErrorException(
        'You are not allowed to update this video. Only the creator can update the video.',
      );
    const updateVideo = await this.videoRepository.updateVideo(
      id,
      updateVideoDto,
    );
    return { data: updateVideo, message: 'Video updated successfully' };
  }

  // async AddVideoToOrg(user: User, videoId: string, orgCategories: OrgCategory[]) {
  //   await this.videoRepository.checkVideoOwner(user.id, videoId);
  //   const orgUser = this.authService.getOrgFromUser(user, orgId);
  //   if (orgUser.type === OrgType.PERSONAL) {
  //     throw new BadRequestException(
  //       'You are not allowed to tranfer this video to org type PERSONAL.You only can tranfer the video from org type ORGANIZATION',
  //     );
  //   }
  //   if (
  //     orgUser.is_owner ||
  //     orgUser.is_permission === UserPermission.UPLOAD ||
  //     orgUser.is_permission === UserPermission.ALL
  //   ) {
  //     const updateVideo =
  //       await this.videoRepository.updateVideoOrgIdsCategoryIds(videoId, orgId);
  //     return {
  //       data: updateVideo,
  //       message: `Add VideoId ${videoId} to orgId ${orgId} successfully`,
  //     };
  //   } else if (
  //     !orgUser.is_owner ||
  //     orgUser.is_permission === UserPermission.READ
  //   ) {
  //     throw new BadRequestException(
  //       'You are not allowed to tranfer this video. Only the owner of the organization and user has permission UPLOAD can tranfer the video.',
  //     );
  //   }
  // }

  async AddVideoToOrg(videoAdds: VideoAdds[]) {
    const updatedVideos = await this.videoRepository.AddVideoToOrg(videoAdds);
    return { data: updatedVideos, message: 'Video added to org successfully' };
  }

  async deleteVideo(id: string) {
    const video = await this.videoRepository.getVideoById(id);
    if (!video) throw new NotFoundException(`Video id ${id} not found`);
    // const Bucket = this.configService.get<string>(EnvVariables.BUCKET_NAME);
    // try {
    // const deleteCommand = new DeleteObjectCommand({
    //   Bucket,
    //   Key: video.source,
    // });
    // await this.s3.send(deleteCommand);
    await this.videoRepository.deleteVideo(id);
    // } catch (e) {
    //   throw new InternalServerErrorException('Error deleting video on aws S3');
    // }
    return { data: video, message: 'Video deleted successfully' };
  }

  async removeVideoFromOrg(user: User, videoId: string, orgId: string) {
    const org = this.authService.getOrgFromUser(user, orgId);
    if (org.type === OrgType.PERSONAL) {
      throw new BadRequestException(
        'You are not allowed to remove this video from org type PERSONAL. You only can remove the video from org type ORGANIZATION.',
      );
    }
    if (!org.is_owner) {
      throw new BadRequestException(
        'You are not allowed to remove this video. Only the owner of the organization can remove the video.',
      );
    }
    const videoRemoved = await this.videoRepository.removeVideoFromOrg(
      videoId,
      orgId,
    );
    return {
      data: videoRemoved,
      message: `VideoId ${videoId} removed from orgId ${orgId} successfull`,
    };
  }

  // async test(userId: string, orgId: string, testDto: TestDto) {
  //   const { videoUrl } = testDto;
  //   return await this.transcriptAndProcess(userId, orgId, videoUrl);
  // }

  async transcribeVideo(userId: string, orgId: string, videoUrl: string) {
    const s3Url = convertS3Url(videoUrl);
    this.logger.log(`Starting transcrip video for: ${s3Url}`);
    try {
      await this.rabbitmqService.ensureConnection();
      this.rabbitmqService.emitEvent('transcribe', {
        userId,
        orgId,
        videoUrl: s3Url,
      });
    } catch (error) {
      this.logger.error(`Error in transcript and process:`, error);
      throw new InternalServerErrorException('Error transcript video');
    }
  }

  async processVideoData(user: User, orgId: string, videoUrl: string) {
    const userVideo: UserApp = {
      id: user.id,
      email: user.email,
      name: user.name,
      given_name: user.given_name,
      family_name: user.family_name,
      picture: user.picture,
      subscription: user.subscription,
    };
    let video: VideoTemp = {
      source: videoUrl,
      user: userVideo,
      orgId,
      title: '',
      description: '',
      transcript: '',
      categoryId: [],
      s3Url: '',
    };

    this.logger.log(`Starting video processing for: ${video.source}`);

    try {
      await this.rabbitmqService.ensureConnection();

      const s3Url = convertS3Url(videoUrl);
      this.logger.log(`Starting video processing for: ${s3Url}`);
      video.s3Url = s3Url;
      const transcribeResponse = (await firstValueFrom(
        this.rabbitmqService.sendMessage<TranscribeRes>(
          { cmd: 'transcribe' },
          { videoUrl: s3Url },
        ),
      )) as TranscribeRes;

      if (!transcribeResponse.transcript) {
        const newVideo = await this.saveNewVideoWithouttranscript(
          user,
          orgId,
          videoUrl,
        );
        return {
          data: newVideo,
          message: 'Video processed and saved successfully',
        };
      }
      video.transcript = transcribeResponse.transcript;

      const categories = await this.categoryRepository.getCategories(orgId);
      const categoryNames = categories.map((category) => category.name);

      const videoDataResponse = (await firstValueFrom(
        this.rabbitmqService.sendMessage<VideoDataRes>(
          { cmd: 'video-data' },
          {
            transcript: video.transcript,
            categories: categoryNames,
          },
        ),
      )) as VideoDataRes;

      this.logger.log(
        'Response from video data processing:',
        videoDataResponse,
      );

      video.title = videoDataResponse.title;
      video.description = videoDataResponse.description;

      if (videoDataResponse.isNewCategory) {
        this.logger.log('Is new category');
        const newCategory = await this.categoryRepository.createCatogory(
          video.orgId,
          videoDataResponse.category,
        );
        video.categoryId.push(newCategory._id);
      } else {
        this.logger.log('Is not new category');
        const category = await this.categoryRepository.getCategoryByName(
          videoDataResponse.category,
        );
        video.categoryId.push(category._id);
      }

      const savedVideo = await this.saveNewVideo(video);
      this.logger.log('Saved video', savedVideo);
      this.logger.log('Starting nsfw check');
      this.rabbitmqService.emitEvent('check-nsfw', {
        videoUrl: video.s3Url,
        videoId: savedVideo._id,
      });
      this.logger.log('Finished nsfw check');
      return {
        data: savedVideo,
        message: 'Video processed and saved successfully',
      };
    } catch (error) {
      this.logger.error(`Error in transcript and process:`, error);
      throw new InternalServerErrorException('Error processing video');
    }
  }

  async saveNewVideo(video: VideoTemp) {
    const reSource = extractS3Path(video.source);
    this.logger.log(`Resource: ${reSource}`);
    this.logger.log('video temp', video);
    try {
      const newVideo = await this.videoRepository.createVideo(
        video.user,
        video.orgId,
        reSource,
        {
          title: video.title,
          description: video.description,
          categoryId: video.categoryId,
          transcript: video.transcript,
        },
      );
      this.logger.log('Create video', newVideo);
      return newVideo;
    } catch (e) {
      this.logger.error('Save new Video error');
      throw new InternalServerErrorException('Error saveNewVideo');
    }
  }

  async saveNewVideoWithouttranscript(
    user: UserApp,
    orgId: string,
    videoUrl: string,
  ) {
    try {
      const s3Url = convertS3Url(videoUrl);
      const newVideo = await this.videoRepository.createVideoWithoutTranscript(
        user,
        orgId,
        videoUrl,
      );
      this.logger.log('Create video', newVideo);
      this.rabbitmqService.emitEvent('check-nsfw', {
        videoUrl: s3Url,
        videoId: newVideo._id,
      });
      return newVideo;
    } catch (e) {
      this.logger.error('Save new Video error');
      throw new InternalServerErrorException('Error saveNewVideo');
    }
  }

  async handleNsfw(data: ResultNSFWRes) {
    this.logger.log(`Prossing handle nsfw for videoId ${data.videoId}`);
    this.logger.log('Is nsfw', data.isNSFW);
    try {
      this.logger.log('Starting update nswf for video');
      const video = await this.videoRepository.updateVideoNSFW(
        data.videoId,
        data.isNSFW,
        data.dominantCategory,
      );
      this.logger.log('Finished update nsfw for video', video);
    } catch (e) {
      this.logger.error('Error handleNsfw', e);
      throw new InternalServerErrorException(e);
    }
  }
}
