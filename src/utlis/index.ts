import { ConfigService } from '@nestjs/config';
import { EnvVariables } from 'src/constants';

export const convertS3Url = (url: string) => {
  const configService = new ConfigService();
  const bucketName = configService.get<string>(EnvVariables.BUCKET_NAME);
  return `s3://${bucketName}/${url}`;
};
