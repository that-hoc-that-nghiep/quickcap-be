import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateInviteDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  receiverId: string;
}
