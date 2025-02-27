import { ApiProperty } from "@nestjs/swagger";
import { Video } from "../video.schema";

export class VideoResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: Video })
  data: Video;
}