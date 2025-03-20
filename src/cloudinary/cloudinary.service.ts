import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { v2 as cloudinary } from 'cloudinary';
import { EnvVariables } from 'src/constants';
@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>(EnvVariables.CLOUDINARY_NAME),
      api_key: this.configService.get<string>(EnvVariables.CLOUDINARY_API_KEY),
      api_secret: this.configService.get<string>(
        EnvVariables.CLOUDINARY_API_SECRET,
      ),
    });
  }
  private readonly logger = new Logger(CloudinaryService.name);

  async uploadThumbnail(file: Express.Multer.File) {
    this.logger.log(`Start upload file to cloudinary ${file.originalname}`);
    try {
      return new Promise((resolve, reject) => {
        const streamifier = require('streamifier');

        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'thumbnails',
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) {
              this.logger.error(error);
              return reject(error);
            }
            const cloudinaryUrl = cloudinary.url(result.public_id);
            this.logger.log(
              `Finish upload file to cloudinary ${cloudinaryUrl}`,
            );

            resolve({
              data: cloudinaryUrl,
              url: result.secure_url,
              message: 'File uploaded on cloudinary successfully',
            });
          },
        );

        this.logger.log(`Pipe buffer in uploadStream`);
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
        this.logger.log(`Finish upload file to cloudinary`);
      });
    } catch (error) {
      this.logger.error(error);
    }
  }
}
