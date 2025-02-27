import { ApiProperty } from '@nestjs/swagger';
import { Comment } from '../comment.schema';

export class CommentsResDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: [Comment] })
  data: Comment[];
}
