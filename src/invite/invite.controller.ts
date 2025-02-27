import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { InviteService } from './invite.service';
import { ApiBody, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  GetToken,
  GetUser,
  GetUserAndToken,
} from 'src/decorators/get-user.decorator';

import { CreateInviteDto } from './dto/create-invite.dto';
import { User } from 'src/constants/user';

@ApiTags('Invite')
@ApiSecurity('token')
@Controller('invite')
export class InviteController {
  constructor(private inviteService: InviteService) {}

  @Post(':orgId')
  @ApiOperation({ summary: 'Send invite' })
  @ApiBody({ type: CreateInviteDto })
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
  async getInviteById(@Param('id') id: string) {
    return this.inviteService.getInviteById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Accept invite' })
  async acceptInvite(@GetToken() token: string, @Param('id') id: string) {
    return this.inviteService.acceptInvite(id, token);
  }
}
