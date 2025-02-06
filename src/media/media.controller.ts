import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { GetUser } from 'src/decorators/get-user.decorator';
import { UpdateMediaDto } from './dto/update-media.dto';

@ApiTags('Media')
@ApiSecurity('token')
@Controller('media')
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post()
  createMedia(@GetUser('id') userId: string) {
    return this.mediaService.createMedia(userId);
  }

  @Get(':id')
  getMediaByUserId(@Param('id') id: string) {
    return this.mediaService.getMediaByUserId(id);
  }

  @Patch(':id')
  updateMedia(@Param('id') id: string, @Body() updateMediaDto: UpdateMediaDto) {
    return this.mediaService.updateMedia(id, updateMediaDto);
  }
}
