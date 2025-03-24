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
    token: string,
  ) {
    const { receiverId } = createInviteDto;
    const receiverUser: User = await this.authService.getUserById(
      receiverId,
      token,
    );
    const orgUser = this.authService.getOrgFromUser(user, orgId);
    if (orgUser.type === OrgType.PERSONAL) {
      throw new BadRequestException(
        'You cannot invite user to your personal org',
      );
    }
    const subject = `Invitation to Join ${orgUser.name} on Quickcap App`;
    const content = `You have been invited to join the organization "${orgUser.name}" on Quickcap App by ${user.name}. 
    
Go to the Quickcap App, select the Invites section, check the invitation, and accept it to join the organization.`;
    const inviteLink = 'https://app.quickcap.live';
    const invite = await this.inviteRepository.createInvite(
      user.id,
      orgId,
      content,
      createInviteDto,
      receiverUser.email,
    );

    return this.mailerService
      .sendMail({
        to: receiverUser.email,
        subject: subject,
        text: `${content}
        
Invite Link: ${inviteLink}`,
        html: ` <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Organization Invitation</h2>
            <p>${content}</p>
            <a href="${inviteLink}" 
               style="display: inline-block; background-color: #000; 
                      color: #fff; 
                      padding: 10px 20px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      margin-top: 15px;">
              Go to Quickcap App
            </a>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">
              If the button doesn't work, copy and paste this link: ${inviteLink}
            </p>
          </div>`,
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

  async acceptInvite(id: string, token: string) {
    const invite = await this.inviteRepository.getInviteById(id);
    await this.authService.addUserToOrg(
      invite.emailReceiver,
      invite.orgId,
      token,
    );
    const inviteAccepted = await this.inviteRepository.updateInvite(id, true);
    return { data: inviteAccepted, message: 'Invite accepted successfully' };
  }

  async getInvitesByOrgIdAndReceiverId(orgId: string, receiverId: string) {
    const invites = await this.inviteRepository.getInvitesByOrgIdAndReceiverId(
      orgId,
      receiverId,
    );
    return { data: invites, message: 'Invites fetched successfully' };
  }
}
