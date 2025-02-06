import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InviteRepository } from './invite.repository';
import { CreateInviteDto } from './dto/create-invite.dto';
import { AuthService, User } from 'src/auth/auth.service';

@Injectable()
export class InviteService {
  constructor(
    private mailerService: MailerService,
    private inviteRepository: InviteRepository,
    private authService: AuthService,
  ) {}

  async sendInvite(
    user: User,
    orgId: string,
    createInviteDto: CreateInviteDto,
  ) {
    const { email } = createInviteDto;
    const orgName = this.authService.getOrgFromUser(user, orgId).name;
    const content = `You are invited to join ${orgName} org, click accept to confirm`;
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
    const invite = await this.inviteRepository.updateInvite(id, true);
    return { data: invite, message: 'Invite accepted successfully' };
  }
}
