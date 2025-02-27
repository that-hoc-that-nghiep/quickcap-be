import { ApiProperty } from '@nestjs/swagger';
import { Invite } from '../invite.schema';

export class InviteResDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: Invite })
  data: Invite;
}
