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
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { VideoType } from 'src/constants/video';
import { AuthService } from 'src/auth/auth.service';
import { EnvVariables } from 'src/constants';
import { User, UserPermission } from 'src/constants/user';
import { OrgType } from 'src/constants/org';
import { TestDto } from './dto/test.dto';
import { RabbitmqService } from 'src/rabbitmq/rabbitmq.service';
import { VideoDataRes } from './dto/video-data.res';
import { TranscribeRes } from './dto/transcibe.res';
import { convertS3Url, extractS3Path } from 'src/utlis';
import { ResultNSFWRes } from './dto/result-nsfw.res';
import { checkNsfwReq } from './dto/check-nsfw.req';
import { firstValueFrom } from 'rxjs';

interface VideoTemp {
  source: string;
  userId: string;
  orgId: string;
  title: string;
  description: string;
  transcript: string;
  categoryId: string[];
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

  async uploadVideo(userId: string, orgId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const sanitizedFileName = file.originalname.replace(/\s+/g, '_');
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
      return await this.transcribeVideo(userId, orgId, Key);
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
    if (video.type === VideoType.PUBLIC) {
      return res;
    } else if (video.type === VideoType.PRIVATE) {
      if (
        user.id === video.userId ||
        this.authService.isUserInVideoOrg(user, video.orgId)
      ) {
        return res;
      }
      throw new UnauthorizedException(
        'You are not allowed to access this video',
      );
    }
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
    if (video.userId !== userId)
      throw new InternalServerErrorException(
        'You are not allowed to update this video. Only the creator can update the video.',
      );
    const updateVideo = await this.videoRepository.updateVideo(
      id,
      updateVideoDto,
    );
    return { data: updateVideo, message: 'Video updated successfully' };
  }

  async tranferLocationVideo(user: User, orgId: string, videoId: string) {
    await this.videoRepository.checkVideoOwner(user.id, videoId);
    const orgUser = this.authService.getOrgFromUser(user, orgId);
    if (orgUser.type === OrgType.PERSONAL) {
      throw new BadRequestException(
        'You are not allowed to tranfer this video to org type PERSONAL.You only can tranfer the video from org type ORGANIZATION',
      );
    }
    if (
      orgUser.is_owner ||
      orgUser.is_permission === UserPermission.UPLOAD ||
      orgUser.is_permission === UserPermission.ALL
    ) {
      const updateVideo = await this.videoRepository.updateVideoOrgId(
        videoId,
        orgId,
      );
      return {
        data: updateVideo,
        message: `Add VideoId ${videoId} to orgId ${orgId} successfully`,
      };
    } else if (
      !orgUser.is_owner ||
      orgUser.is_permission === UserPermission.READ
    ) {
      throw new BadRequestException(
        'You are not allowed to tranfer this video. Only the owner of the organization and user has permission UPLOAD can tranfer the video.',
      );
    }
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

  async processVideoData(
    userId: string,
    orgId: string,
    videoUrl: string,
    transcript: string,
  ) {
    let video: VideoTemp = {
      source: videoUrl,
      userId,
      orgId,
      title: '',
      description: '',
      transcript: transcript,
      categoryId: [],
    };

    this.logger.log(`Starting video processing for: ${video.source}`);

    try {
      await this.rabbitmqService.ensureConnection();
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
        videoUrl: video.source,
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
    this.logger.log(`Re source: ${reSource}`);
    try {
      const newVideo = await this.videoRepository.createVideo(
        video.userId,
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
    userId: string,
    orgId: string,
    videoUrl: string,
  ) {
    const reSource = extractS3Path(videoUrl);
    this.logger.log(`Re source: ${reSource}`);
    try {
      const newVideo = await this.videoRepository.createVideoWithoutTranscript(
        userId,
        orgId,
        reSource,
      );
      this.logger.log('Create video', newVideo);
      this.rabbitmqService.emitEvent('check-nsfw', {
        videoUrl: videoUrl,
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
