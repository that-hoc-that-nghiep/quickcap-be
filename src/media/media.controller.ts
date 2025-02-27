import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { GetUser } from 'src/decorators/get-user.decorator';
import { UpdateMediaDto } from './dto/update-media.dto';
import { MediaResDto } from './dto/media-res.dto';

@ApiTags('Media')
@ApiSecurity('token')
@Controller('media')
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: 'Media created successfully',
    type: MediaResDto,
  })
  createMedia(@GetUser('id') userId: string) {
    return this.mediaService.createMedia(userId);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Media found successfully',
    type: MediaResDto,
  })
  getMediaByUserId(@Param('id') id: string) {
    return this.mediaService.getMediaByUserId(id);
  }

  @Patch(':id')
  @ApiResponse({
    status: 200,
    description: 'Media updated successfully',
    type: MediaResDto,
  })
  updateMedia(@Param('id') id: string, @Body() updateMediaDto: UpdateMediaDto) {
    return this.mediaService.updateMedia(id, updateMediaDto);
  }
}
