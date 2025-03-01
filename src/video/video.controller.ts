import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
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
import { SwaggerArrayConversion } from 'src/interceptors/swagger-array.interceptor';
import { UpdateVideoDto } from './dto/update-video.dto';
import { VideoType } from 'src/constants/video';
import { OrgType } from 'src/constants/org';
import { User } from 'src/constants/user';
import { Video } from './video.schema';
import { VideoResponseDto } from './dto/video-res.dto';
import { VideosResponseDto } from './dto/videos-res.dto';

@ApiTags('Video')
@ApiSecurity('token')
@Controller('video')
export class VideoController {
  constructor(private videoService: VideoService) {}

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
    return this.videoService.getAllVideos(user, orgId, limit, page, keyword,categoryId);
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
}
