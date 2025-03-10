import { ApiProperty } from '@nestjs/swagger';
import { Message } from 'src/constants/conversation';

export class ConversationsResDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;
  
  @ApiProperty({
    type: [Message],
  })
  conversations: Message[];
}
