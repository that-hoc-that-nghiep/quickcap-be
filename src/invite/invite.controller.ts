import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { InviteService } from './invite.service';
import { ApiBody, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/decorators/get-user.decorator';
import { User } from 'src/auth/auth.service';
import { CreateInviteDto } from './dto/create-invite.dto';

@ApiTags('Invite')
@ApiSecurity('token')
@Controller('invite')
export class InviteController {
  constructor(private inviteService: InviteService) {}

  @Post(':orgId')
  @ApiOperation({ summary: 'Send invite' })
  @ApiBody({ type: CreateInviteDto })
  async sendInvite(
    @GetUser() user: User,
    @Param('orgId') orgId: string,
    @Body() createInviteDto: CreateInviteDto,
  ) {
    return this.inviteService.sendInvite(user, orgId, createInviteDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invite by id' })
  async getInviteById(@Param('id') id: string) {
    return this.inviteService.getInviteById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Accept invite' })
  async acceptInvite(@Param('id') id: string) {
    return this.inviteService.acceptInvite(id);
  }
}
