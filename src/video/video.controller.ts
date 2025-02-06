import {
  BadRequestException,
  Controller,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { VideoService } from './video.service';
import { ApiBodyWithSingleFile } from 'src/decorators/swagger-form-data.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetUser } from 'src/decorators/get-user.decorator';
import { CreateVideoDto } from './dto/create-video.dto';
import { title } from 'process';

@ApiTags('Video')
@ApiSecurity('token')
@Controller('video')
export class VideoController {
  constructor(private videoService: VideoService) {}

  @ApiOperation({ summary: 'Upload video' })
  @ApiParam({ name: 'orgId', type: 'string' })
  @ApiBodyWithSingleFile(
    'file',
    {
      title: {
        type: 'string',
        default: 'Caculating Math',
      },
      description: {
        type: 'string',
        default: 'this is a description',
      },
      summary: {
        type: 'string',
        default: 'this is a summary',
      },

      categoryId: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
    ['file', 'title', 'description', 'summary', 'categoryId'],
    {
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
    },
  )
  @Post(':orgId')
  uploadVideo(
    @GetUser('id') userId: string,
    @Param('orgId') orgId: string,
    createVideoDto: CreateVideoDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.videoService.uploadVideo(userId, orgId, createVideoDto, file);
  }
}
