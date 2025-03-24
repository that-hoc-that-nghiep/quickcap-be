import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { InviteService } from './invite.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import {
  GetToken,
  GetUser,
  GetUserAndToken,
} from 'src/decorators/get-user.decorator';

import { CreateInviteDto } from './dto/create-invite.dto';
import { User } from 'src/constants/user';
import { InviteResDto } from './dto/invite-res.dto';
import { InvitesResDto } from './dto/invites-res.dto';

@ApiTags('Invite')
@ApiSecurity('token')
@Controller('invite')
export class InviteController {
  constructor(private inviteService: InviteService) {}

  @Post(':orgId')
  @ApiOperation({ summary: 'Send invite' })
  @ApiBody({ type: CreateInviteDto })
  @ApiResponse({
    status: 201,
    description: 'Invite sent successfully',
    type: InviteResDto,
  })
  async sendInvite(
    @GetUserAndToken()
    dataReq: {
      user: User;
      token: string;
    },
    @Param('orgId') orgId: string,
    @Body() createInviteDto: CreateInviteDto,
  ) {
    return this.inviteService.sendInvite(
      dataReq.user,
      orgId,
      createInviteDto,
      dataReq.token,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invite by id' })
  @ApiResponse({
    status: 200,
    description: 'Invite fetched successfully',
    type: InviteResDto,
  })
  async getInviteById(@Param('id') id: string) {
    return this.inviteService.getInviteById(id);
  }

  @Get('all/:receiverId')
  @ApiOperation({ summary: 'Get invites by receiverId' })
  @ApiResponse({
    status: 200,
    description: 'Invites fetched successfully',
    type: [InvitesResDto],
  })
  @ApiParam({ name: 'receiverId', type: 'string' })
  async getInvitesAndReceiverId(@Param('receiverId') receiverId: string) {
    return this.inviteService.getInvitesByReceiverId(receiverId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Accept invite' })
  @ApiResponse({
    status: 200,
    description: 'Invite accepted successfully',
    type: InviteResDto,
  })
  async acceptInvite(@GetToken() token: string, @Param('id') id: string) {
    return this.inviteService.acceptInvite(id, token);
  }
}
