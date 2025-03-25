import { ApiProperty } from '@nestjs/swagger';
import { VideoAdds } from 'src/constants/video';

export class AddVideoToOrgDto {
  @ApiProperty({ type: [VideoAdds] })
  videoAdds: VideoAdds[];
}
