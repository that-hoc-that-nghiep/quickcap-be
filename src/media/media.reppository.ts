import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Media } from './media.schema';
import { Model } from 'mongoose';
import { UpdateMediaDto } from './dto/update-media.dto';

@Injectable()
export class MediaRepository {
  constructor(@InjectModel(Media.name) private mediaModel: Model<Media>) {}

  async createMedia(userId: string): Promise<Media> {
    const media = await this.mediaModel.create({ userId });
    return media;
  }

  async getMediaByUserId(id: string): Promise<Media> {
    const media = await this.mediaModel.findById(id).exec();
    if (!media) throw new NotFoundException(`Media id ${id} not found`);
    return media;
  }

  async updateMedia(
    id: string,
    updateMediaDto: UpdateMediaDto,
  ): Promise<Media> {
    const media = await this.mediaModel
      .findByIdAndUpdate(id, updateMediaDto, { new: true })
      .exec();
    if (!media) throw new NotFoundException(`Media id ${id} not found`);
    return media;
  }
}
