import { ApiProperty } from '@nestjs/swagger';
import { Invite } from '../invite.schema';

export class InvitesResDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: [Invite] })
  data: Invite[];
}
