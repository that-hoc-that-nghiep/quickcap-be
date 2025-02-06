import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { VideoRepository } from './video.repository';
import { CategoryRepository } from 'src/category/category.repository';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import { CreateVideoDto } from './dto/create-video.dto';
import { Update } from 'aws-sdk/clients/dynamodb';
import { UpdateVideoDto } from './dto/update-video.dto';
@Injectable()
export class VideoService {
  constructor(
    private videoRepository: VideoRepository,
    private categoryRepository: CategoryRepository,
    private configService: ConfigService,
  ) {}
  private readonly s3 = new S3Client({
    credentials: {
      accessKeyId: this.configService.get<string>('ACCESS_KEY'),
      secretAccessKey: this.configService.get<string>('SECRET_KEY'),
    },
    region: this.configService.get<string>('BUCKET_REGION'),
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
    const Key = `${uuid()}-${file.originalname}.${file.mimetype.split('/')[1]}`;
    const Bucket = this.configService.get<string>('BUCKET_NAME');
    const ContentType = file.mimetype;
    const command = new PutObjectCommand({
      Bucket,
      Key,
      Body: file.buffer,
      ContentType,
    });
    try {
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
    } catch (e) {
      throw new InternalServerErrorException(
        'Something went wrong while uploading video.',
      );
    }
  }

  async getAllVideos() {
    const videos = await this.videoRepository.getAllVideos();
    return { data: videos, message: 'Videos fetched successfully' };
  }

  async getVideoById(id: string) {
    const video = await this.videoRepository.getVideoById(id);
    return { data: video, message: 'Video fetched successfully' };
  }

  async updateVideo(id: string, updateVideoDto: UpdateVideoDto) {
    const { categoryId } = updateVideoDto;
    await this.categoryRepository.getCategoryByArrayId(categoryId);
    const video = await this.videoRepository.updateVideo(id, updateVideoDto);
    return { data: video, message: 'Video updated successfully' };
  }

  async deleteVideo(id: string) {
    const video = await this.videoRepository.deleteVideo(id);
    return { data: video, message: 'Video deleted successfully' };
  }
}
