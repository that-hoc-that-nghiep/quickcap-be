import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { VideoRepository } from './video.repository';
import { CategoryRepository } from 'src/category/category.repository';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';

import { VideoType } from 'src/constants/video';
import { AuthService} from 'src/auth/auth.service';
import { EnvVariables } from 'src/constants';
import { User } from 'src/constants/user';
@Injectable()
export class VideoService {
  constructor(
    private authService: AuthService,
    private videoRepository: VideoRepository,
    private categoryRepository: CategoryRepository,
    private configService: ConfigService,
  ) {}
  private readonly s3 = new S3Client({
    credentials: {
      accessKeyId: this.configService.get<string>(EnvVariables.ACCESS_KEY),
      secretAccessKey: this.configService.get<string>(EnvVariables.SECRET_KEY),
    },
    region: this.configService.get<string>(EnvVariables.BUCKET_REGION),
  });

  async uploadVideo(
    userId: string,
    orgId: string,
    createVideoDto: CreateVideoDto,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const Key: string = `${uuid()}-${file.originalname}`;
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
      const video = await this.videoRepository.createVideo(
        userId,
        orgId,
        Key,
        createVideoDto,
      );
      return { data: video, message: 'Video uploaded successfully' };
    }
  }

  async getAllVideos(
    user: User,
    orgId: string,
    limit: number,
    page: number,
    keyword?: string,
  ) {
    if (!this.authService.isUserInOrg(user, orgId)) {
      throw new UnauthorizedException('User is not in the organization');
    }
    const videos = await this.videoRepository.getAllVideos(
      orgId,
      limit,
      page,
      keyword,
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

  async deleteVideo(id: string) {
    const video = await this.videoRepository.deleteVideo(id);
    return { data: video, message: 'Video deleted successfully' };
  }
}
