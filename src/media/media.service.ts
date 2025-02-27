import { Injectable } from '@nestjs/common';
import { MediaRepository } from './media.reppository';

@Injectable()
export class MediaService {
  constructor(private mediaRepository: MediaRepository) {}

  async createMedia(userId: string) {
    const media = await this.mediaRepository.createMedia(userId);
    return { data: media, message: 'Media created successfully' };
  }

  async getMediaByUserId(id: string) {
    const media = await this.mediaRepository.getMediaByUserId(id);
    return { data: media, message: 'Media found successfully' };
  }

  async updateMedia(id: string, updateMediaDto: any) {
    const media = await this.mediaRepository.updateMedia(id, updateMediaDto);
    return { data: media, message: 'Media updated successfully' };
  }
}
