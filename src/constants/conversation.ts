import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
export enum RoleChat {
  USER = 'user',
  BOT = 'bot',
}

export class Message {
  @ApiProperty({
    enum: RoleChat,
    enumName: 'Role',
    description: 'The role of the message sender, values: user, bot',
  })
  @IsEnum(RoleChat)
  role: RoleChat;

  @ApiProperty()
  @IsString()
  text: string;
}
