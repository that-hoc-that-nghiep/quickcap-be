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
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { VideoService } from './video.service';
import {
  ApiDocsPagination,
} from 'src/decorators/swagger-form-data.decorator';

import { GetUser } from 'src/decorators/get-user.decorator';
import { CreateVideoDto } from './dto/create-video.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { SwaggerArrayConversion } from 'src/interceptors/swagger-array.interceptor';
import { UpdateVideoDto } from './dto/update-video.dto';
import { VideoType } from 'src/constants/video';
import { User } from 'src/auth/auth.service';


@ApiTags('Video')
@ApiSecurity('token')
@Controller('video')
export class VideoController {
  constructor(private videoService: VideoService) {}

  @Post(':orgId')
  @ApiOperation({ summary: 'Upload video' })
  @ApiParam({ name: 'orgId', type: 'string' })
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
  @UseInterceptors(new SwaggerArrayConversion('categoryId'))
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
  uploadVideo(
    @GetUser('id') userId: string,
    @Param('orgId') orgId: string,
    @Body() createVideoDto: CreateVideoDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.videoService.uploadVideo(userId, orgId, createVideoDto, file);
  }

  @Get('all/:orgId')
  @ApiOperation({ summary: 'Get all videos' })
  @ApiParam({ name: 'orgId', type: 'string' })
  @ApiDocsPagination('video')
  getVideos(
    @GetUser() user: User,
    @Param('orgId') orgId: string,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('page', ParseIntPipe) page: number,
    @Query('keyword') keyword?: string,
  ) {
    return this.videoService.getAllVideos(user, orgId, limit, page, keyword);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get video by id' })
  @ApiParam({ name: 'id', type: 'string', example: '67a4697b778e9debdc6745a1' })
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
  deleteVideo(@Param('id') id: string) {
    return this.videoService.deleteVideo(id);
  }
}
