import { ApiProperty } from '@nestjs/swagger';
import { Comment } from '../comment.schema';

export class CommentResDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: Comment })
  data: Comment;
}
