import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InviteRepository } from './invite.repository';
import { CreateInviteDto } from './dto/create-invite.dto';
import { AuthService } from 'src/auth/auth.service';
import { OrgType } from 'src/constants/org';
import { User } from 'src/constants/user';

@Injectable()
export class InviteService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly inviteRepository: InviteRepository,
    private readonly authService: AuthService,
  ) {}

  async sendInvite(
    user: User,
    orgId: string,
    createInviteDto: CreateInviteDto,
  ) {
    const { email } = createInviteDto;
    const orgUser = this.authService.getOrgFromUser(user, orgId);
    if (orgUser.type === OrgType.PERSONAL) {
      throw new BadRequestException(
        'You cannot invite user to your personal org',
      );
    }
    const content = `You are invited to join ${orgUser.name} org, click accept to confirm`;
    const invite = await this.inviteRepository.createInvite(
      user.id,
      orgId,
      content,
      createInviteDto,
    );

    return this.mailerService
      .sendMail({
        to: email,
        subject: "You've been invited from Quickcap App",
        text: content,
        html: `<a href="" style="background-color: #000; color: #fff; padding: 5px 10px; border-radius: 10px;">Accept Invite</a>`,
      })
      .then(() => ({
        message: 'Invite sent successfully',
        data: invite,
      }))
      .catch((error) => {
        throw new InternalServerErrorException(
          `Failed to send invite email: ${error.message}`,
        );
      });
  }

  async getInviteById(id: string) {
    const invite = await this.inviteRepository.getInviteById(id);
    return { data: invite, message: 'Invite fetched successfully' };
  }

  async acceptInvite(id: string) {
    const invite = await this.inviteRepository.getInviteById(id);
    await this.authService.addUserToOrg(invite.receiverId, invite.orgId);
    const inviteAccepted = await this.inviteRepository.updateInvite(id, true);
    return { data: inviteAccepted, message: 'Invite accepted successfully' };
  }
}
