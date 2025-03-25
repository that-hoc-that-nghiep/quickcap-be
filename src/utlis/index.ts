import { ConfigService } from '@nestjs/config';
import { EnvVariables } from 'src/constants';

export const convertS3Url = (url: string) => {
  const configService = new ConfigService();
  const bucketName = configService.get<string>(EnvVariables.BUCKET_NAME);
  return `s3://${bucketName}/${url}`;
};

export function extractS3Path(s3Url: string): string {
  const prefix = 's3://quickcap-bucket-video/';
  return s3Url.startsWith(prefix) ? s3Url.substring(prefix.length) : s3Url;
}

export function removeVietnameseAccents(str: string): string {
  str = str.replace(/\s+/g, '_');

  const from =
      'àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ',
    to =
      'aaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy';

  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(RegExp(from[i], 'gi'), to[i]);
  }

  str = str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_');

  return str;
}
