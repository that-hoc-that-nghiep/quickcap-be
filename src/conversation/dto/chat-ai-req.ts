import { IsArray,IsString } from 'class-validator';
import { Message } from 'src/constants/conversation';

export class CreateMessageDto {
  @IsString()
  question: string;

  @IsArray()
  conversation: Message[];

  @IsString()
  transcript: string;
}
