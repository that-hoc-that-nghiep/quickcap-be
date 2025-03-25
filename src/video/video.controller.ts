import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { VideoService } from './video.service';
import { ApiDocsPagination } from 'src/decorators/swagger-form-data.decorator';
import { GetUser } from 'src/decorators/get-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateVideoDto } from './dto/update-video.dto';
import { OrderVideo } from 'src/constants/video';
import { OrgType } from 'src/constants/org';
import { User } from 'src/constants/user';
import { VideoResponseDto } from './dto/video-res.dto';
import { VideosResponseDto } from './dto/videos-res.dto';
import { EventPattern } from '@nestjs/microservices';
import { ResultNSFWRes } from './dto/result-nsfw.res';
import { AddVideoToOrgDto } from './dto/add-to-org.dto';
import { CategoryVideoModifyDto } from './dto/category-video-modify.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@ApiTags('Video')
@ApiSecurity('token')
@Controller('video')
export class VideoController {
  constructor(
    private videoService: VideoService,
    private CloudinaryService: CloudinaryService,
  ) {}
  private readonly logger = new Logger(VideoController.name);

  // Keep existing video upload endpoint for backward compatibility
  @Post()
  @ApiOperation({
    summary: 'Upload video',
    description: `Video upload on org type **Personal**`,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/video\/(mp4|mkv|avi|webm)/)) {
          return callback(
            new BadRequestException('Only video files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 100 * 1024 * 1024,
      },
    }),
  )
  @ApiResponse({
    status: 201,
    description: 'Video uploaded successfully',
    type: VideoResponseDto,
  })
  async uploadVideo(
    @GetUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const orgId = user.organizations.find(
        (org) => org.type === OrgType.PERSONAL,
      ).id;
      const res = await this.videoService.uploadVideo(user, orgId, file);
      return res;
    } catch (error) {
      this.logger.error('Error uploading video', error);
      throw new InternalServerErrorException(error);
    }
  }

  @Post('chunks')
  @ApiOperation({
    summary: 'Upload video chunk',
    description: 'Upload video in chunks for parallel processing',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fileId: {
          type: 'string',
          description: 'Unique identifier for the file',
        },
        chunkIndex: {
          type: 'number',
          description: 'Current chunk index (0-based)',
        },
        totalChunks: {
          type: 'number',
          description: 'Total number of chunks',
        },
        originalFilename: {
          type: 'string',
          description: 'Original filename',
        },
        chunk: {
          type: 'string',
          format: 'binary',
          description: 'Chunk data',
        },
      },
      required: [
        'fileId',
        'chunkIndex',
        'totalChunks',
        'originalFilename',
        'chunk',
      ],
    },
  })
  @UseInterceptors(
    FileInterceptor('chunk', {
      fileFilter: (req, file, callback) => {
        // For chunks, we accept any mimetype since they might not be recognized correctly
        callback(null, true);
      },
      limits: {
        fileSize: 20 * 1024 * 1024, // 20MB limit per chunk
      },
    }),
  )
  @ApiResponse({
    status: 201,
    description: 'Chunk uploaded successfully',
  })
  async uploadVideoChunk(
    @GetUser() user: User,
    @UploadedFile() chunk: Express.Multer.File,
    @Query('fileId') fileId: string,
    @Query('chunkIndex', ParseIntPipe) chunkIndex: number,
    @Query('totalChunks', ParseIntPipe) totalChunks: number,
    @Query('originalFilename') originalFilename: string,
  ) {
    try {
      const orgId = user.organizations.find(
        (org) => org.type === OrgType.PERSONAL,
      ).id;

      return await this.videoService.uploadVideoChunk(
        user,
        orgId,
        fileId,
        chunkIndex,
        totalChunks,
        originalFilename,
        chunk,
      );
    } catch (error) {
      this.logger.error('Error uploading video chunk', error);
      throw new InternalServerErrorException(error);
    }
  }

  @Get('chunks/status')
  @ApiOperation({
    summary: 'Check chunk upload status',
    description: 'Check the status of a chunked upload',
  })
  @ApiQuery({
    name: 'fileId',
    type: 'string',
    description: 'File identifier',
    required: true,
  })
  @ApiQuery({
    name: 'totalChunks',
    type: 'number',
    description: 'Total number of chunks',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Upload status retrieved successfully',
  })
  async getChunkUploadStatus(
    @Query('fileId') fileId: string,
    @Query('totalChunks', ParseIntPipe) totalChunks: number,
  ) {
    try {
      const status = await this.videoService.getChunkUploadStatus(
        fileId,
        totalChunks,
      );
      return {
        message: 'Upload status retrieved successfully',
        status,
      };
    } catch (error) {
      this.logger.error('Error getting chunk upload status', error);
      throw new InternalServerErrorException(error);
    }
  }

  @ApiOperation({
    summary: 'Upload thumbnail',
  })
  @Post('thumbnail/:videoId')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|gif|webp)$/)) {
          return callback(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // Giới hạn kích thước 5MB
      },
    }),
  )
  @ApiResponse({
    status: 201,
    description: 'Video uploaded successfully',
    type: VideoResponseDto,
  })
  async uploadThumbnail(
    @Param('videoId') videoId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const resCloudinary = (await this.CloudinaryService.uploadThumbnail(
        file,
      )) as {
        data: string;
        url?: string;
        message: string;
      };
      const res = await this.videoService.uploadThumbnail(
        videoId,
        resCloudinary.data as string,
      );
      return res;
    } catch (error) {
      this.logger.error('Error uploading thumbnail', error);
      throw new InternalServerErrorException(error);
    }
  }

  @Get('all/:orgId')
  @ApiOperation({ summary: 'Get all videos' })
  @ApiParam({ name: 'orgId', type: 'string' })
  @ApiDocsPagination('video')
  @ApiResponse({
    status: 200,
    description: 'Videos fetched successfully',
    type: VideosResponseDto,
  })
  getVideos(
    @GetUser() user: User,
    @Param('orgId') orgId: string,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('page', ParseIntPipe) page: number,
    @Query('keyword') keyword?: string,
    @Query('categoryId') categoryId?: string,
    @Query('order') order?: OrderVideo,
  ) {
    return this.videoService.getAllVideos(
      user,
      orgId,
      limit,
      page,
      keyword,
      categoryId,
      order,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get video by id' })
  @ApiParam({ name: 'id', type: 'string', example: '67a4697b778e9debdc6745a1' })
  @ApiResponse({
    status: 200,
    description: 'Video fetched successfully',
    type: VideoResponseDto,
  })
  getVideoById(@GetUser() user: User, @Param('id') id: string) {
    try {
      return this.videoService.getVideoById(user, id);
    } catch (error) {
      this.logger.error('Error get video by id', error);
      throw new InternalServerErrorException(error);
    }
  }

  @Get('unique/:orgId')
  @ApiOperation({ summary: 'Get unique videos' })
  @ApiResponse({
    status: 200,
    description: 'Videos fetched successfully',
    type: VideosResponseDto,
  })
  async getUniqueVideos(@GetUser() user: User, @Param('orgId') orgId: string) {
    const orgIdPersonal: string = user.organizations.find(
      (org) => org.type === OrgType.PERSONAL,
    ).id;
    try {
      return this.videoService.getVideosUnique(orgIdPersonal, orgId);
    } catch (error) {
      this.logger.error('Error get unique videos', error);
      throw new InternalServerErrorException(error);
    }
  }

  @Patch('addToOrg')
  @ApiOperation({ summary: 'Add video to organization' })
  @ApiBody({
    type: AddVideoToOrgDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Add video to org successfully',
    type: VideoResponseDto,
  })
  async AddVideoToOrg(@Body() addVideoToOrgDto: AddVideoToOrgDto) {
    try {
      const { videoAdds } = addVideoToOrgDto;
      return this.videoService.AddVideoToOrg(videoAdds);
    } catch (error) {
      this.logger.error('Error adding video to org', error);
      throw new InternalServerErrorException(error);
    }
  }

  @Delete(':id/:orgId')
  @ApiOperation({ summary: 'Delete video by id' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiParam({ name: 'orgId', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Video deleted successfully',
    type: VideoResponseDto,
  })
  deleteVideo(
    @GetUser() user: User,
    @Param('id') id: string,
    @Param('orgId') orgId: string,
  ) {
    try {
      return this.videoService.deleteVideo(user, id, orgId);
    } catch (error) {
      this.logger.error('Error deleting video', error);
      throw new InternalServerErrorException(error);
    }
  }

  @EventPattern('nsfw-result')
  handleCheckNsfw(data: ResultNSFWRes) {
    try {
      this.logger.log(
        'Received nsfw-result event. Data:',
        JSON.stringify(data),
      );
      this.videoService.handleNsfw(data);
    } catch (error) {
      this.logger.error('Error handling nsfw-result event');
      console.error('Error handling nsfw-result event:', error);
    }
  }

  @Patch('modify/:id/add')
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: CategoryVideoModifyDto })
  async addCategoryToVideo(
    @Param('id') id: string,
    @Body() categoryVideoModifyDto: CategoryVideoModifyDto,
  ) {
    try {
      return this.videoService.addCategoryToVideo(
        id,
        categoryVideoModifyDto.categoryId,
      );
    } catch (error) {
      this.logger.error('Error adding category to video', error);
      throw new InternalServerErrorException(error);
    }
  }

  @Patch('modify/:id/remove')
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: CategoryVideoModifyDto })
  async removeCategoryToVideo(
    @Param('id') id: string,
    @Body() categoryVideoModifyDto: CategoryVideoModifyDto,
  ) {
    try {
      return this.videoService.removeCategoryFromVideo(
        id,
        categoryVideoModifyDto.categoryId,
      );
    } catch (error) {
      this.logger.error('Error removing category to video', error);
      throw new InternalServerErrorException(error);
    }
  }

  @Get('analytics/:orgId')
  @ApiParam({ name: 'orgId', type: 'string' })
  async getAnalyticsVideosByOrgId(@Param('orgId') orgId: string) {
    try {
      return this.videoService.getAnalyticsVideosByOrgId(orgId);
    } catch (error) {
      this.logger.error('Error get analytics videos by orgId', error);
      throw new InternalServerErrorException(error);
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update video by id' })
  @ApiParam({ name: 'id', type: 'string', example: '67a4697b778e9debdc6745a1' })
  @ApiBody({
    type: UpdateVideoDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Video updated successfully',
    type: VideoResponseDto,
  })
  updateVideo(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateVideoDto: UpdateVideoDto,
  ) {
    try {
      this.videoService.updateVideo(userId, id, updateVideoDto);
    } catch (error) {
      this.logger.error('Error updating video', error);
      throw new InternalServerErrorException(error);
    }
  }
  @Patch('remove/:id/:orgId')
  @ApiOperation({ summary: 'Remove video from org' })
  @ApiParam({
    name: 'id',
    type: 'string',
  })
  @ApiParam({
    name: 'orgId',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Video removed successfully',
    type: VideoResponseDto,
  })
  @ApiBody({ type: CategoryVideoModifyDto })
  removeVideoFromOrg(
    @Param('id') videoId: string,
    @Param('orgId') orgId: string,
    @Body() categoryVideoModifyDto: CategoryVideoModifyDto,
  ) {
    try {
      const { categoryId } = categoryVideoModifyDto;
      return this.videoService.removeVideoFromOrg(videoId, orgId, categoryId);
    } catch (error) {
      this.logger.error('Error removing video from org', error);
      throw new InternalServerErrorException(error);
    }
  }

  @Get('latest')
  @ApiOperation({
    summary: 'Get latest processed video by fileId',
    description: 'Get the latest video that was processed from chunked upload',
  })
  @ApiQuery({
    name: 'fileId',
    type: 'string',
    description: 'Upload file identifier',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Video retrieved successfully',
    type: VideoResponseDto,
  })
  async getLatestVideo(@GetUser() user: User, @Query('fileId') fileId: string) {
    try {
      const orgId = user.organizations.find(
        (org) => org.type === OrgType.PERSONAL,
      ).id;

      const video = await this.videoService.getLatestVideoByFileId(
        fileId,
        orgId,
      );
      return video;
    } catch (error) {
      this.logger.error('Error getting latest video', error);
      throw new InternalServerErrorException(error);
    }
  }
}
