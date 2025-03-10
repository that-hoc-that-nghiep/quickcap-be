import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
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
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { VideoService } from './video.service';
import { ApiDocsPagination } from 'src/decorators/swagger-form-data.decorator';
import { GetUser } from 'src/decorators/get-user.decorator';
import { CreateVideoDto } from './dto/create-video.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateVideoDto } from './dto/update-video.dto';
import { VideoType } from 'src/constants/video';
import { OrgType } from 'src/constants/org';
import { User } from 'src/constants/user';
import { Video } from './video.schema';
import { VideoResponseDto } from './dto/video-res.dto';
import { VideosResponseDto } from './dto/videos-res.dto';
import { TranferVideoDto } from './dto/tranfer-video.dto';
import { TestDto } from './dto/test.dto';
import { Ctx, EventPattern, Payload } from '@nestjs/microservices';
import { ResultNSFWRes } from './dto/result-nswf.res';
import { CheckNSFWRes } from './dto/test.res.dto';
import { checkNsfwReq } from './dto/check-nswf.req';

@ApiTags('Video')
@ApiSecurity('token')
@Controller('video')
export class VideoController {
  constructor(private videoService: VideoService) {}
  private readonly logger = new Logger(VideoController.name);
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
        title: {
          type: 'string',
          default: 'this is title',
        },
        description: {
          type: 'string',
          default: 'the action of providing or supplying something for use.',
        },
        summary: {
          type: 'string',
          default: 'this is summary',
        },
        'categoryId[]': {
          type: 'array',
          items: {
            type: 'string',
            default: '',
          },
          default: ['67a357027044f67fd112f501', '67a461334e30fba0ac5103f8'],
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['title', 'description', 'summary', 'file'],
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
    @Body() createVideoDto: CreateVideoDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const remakeCreateVideoDto = {
      ...createVideoDto,
      categoryId: createVideoDto.categoryId[0].split(','),
    };
    const orgId = user.organizations.find(
      (org) => org.type === OrgType.PERSONAL,
    ).id;
    const res = await this.videoService.uploadVideo(
      user.id,
      orgId,
      remakeCreateVideoDto,
      file,
    );
    return res;
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
  ) {
    return this.videoService.getAllVideos(
      user,
      orgId,
      limit,
      page,
      keyword,
      categoryId,
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
    return this.videoService.getVideoById(user, id);
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
    return this.videoService.getVideosUnique(orgIdPersonal, orgId);
  }

  @Patch('tranfer')
  @ApiOperation({ summary: 'Tranfer location video to another organization' })
  @ApiBody({
    type: TranferVideoDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Video tranfer successfully',
    type: VideoResponseDto,
  })
  async tranferVideo(
    @GetUser() user: User,
    @Body() tranferVideoDto: TranferVideoDto,
  ) {
    const { videoId, orgId } = tranferVideoDto;
    return this.videoService.tranferLocationVideo(user, orgId, videoId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update video by id' })
  @ApiParam({ name: 'id', type: 'string', example: '67a4697b778e9debdc6745a1' })
  @ApiBody({
    type: UpdateVideoDto,
    examples: {
      video_1: {
        value: {
          title: 'this is title',
          description:
            'the action of providing or supplying something for use.',
          summary: 'this is summary',
          views: 0,
          type: VideoType.PRIVATE,
          categoryId: ['67a357027044f67fd112f501', '67a461334e30fba0ac5103f8'],
        },
      },
      video_2: {
        value: {
          title: 'this is title',
          description:
            'the action of providing or supplying something for use.',
          summary: 'this is summary',
          views: 0,
          type: VideoType.PUBLIC,
          categoryId: ['67a357027044f67fd112f501', '67a461334e30fba0ac5103f8'],
        },
      },
    },
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
    this.videoService.updateVideo(userId, id, updateVideoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete video by id' })
  @ApiParam({ name: 'id', type: 'string', example: '67a4697b778e9debdc6745a1' })
  @ApiResponse({
    status: 200,
    description: 'Video deleted successfully',
    type: VideoResponseDto,
  })
  deleteVideo(@Param('id') id: string) {
    return this.videoService.deleteVideo(id);
  }

  @Delete(':id/:orgId')
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
  removeVideoFromOrg(
    @GetUser() user: User,
    @Param('id') videoId: string,
    @Param('orgId') orgId: string,
  ) {
    return this.videoService.removeVideoFromOrg(user, videoId, orgId);
  }

  @Post('test/:orgId')
  @ApiOperation({ summary: 'Test' })
  @ApiBody({
    type: TestDto,
    examples: {
      video_1: {
        value: {
          videoUrl: 's3://quickcap-bucket-video/baigiangmontiengnhat.mp4',
        },
      },
    },
  })
  @ApiParam({
    name: 'orgId',
    type: 'string',
  })
  test(
    @GetUser('id') userId: string,
    @Param('orgId') orgId: string,
    @Body() testDto: TestDto,
  ) {
    return this.videoService.test(userId, orgId, testDto);
  }

  @EventPattern('forward-video-data')
  async processVideoData(@Payload() data: any) {
    this.videoService.processVideoData(data);
  }

  @EventPattern('forward-check-nsfw')
  async checkNsfw(@Payload() data: checkNsfwReq, @Ctx() context: any) {
    this.videoService.checkNsfw(data.videoUrl, data.videoId);
  }

  @EventPattern('nsfw-result')
  handleCheckNsfw(data: ResultNSFWRes) {
    try {
      console.log('Received nsfw-result event. Data:', JSON.stringify(data));
      // Xử lý việc kiểm tra video
    } catch (error) {
      console.error('Error handling nsfw-result event:', error);
    }
  }
}
