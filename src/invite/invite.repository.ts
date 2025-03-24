import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Invite } from './invite.schema';
import { Model } from 'mongoose';
import { CreateInviteDto } from './dto/create-invite.dto';

@Injectable()
export class InviteRepository {
  constructor(@InjectModel(Invite.name) private inviteModel: Model<Invite>) {}
  async createInvite(
    userId: string,
    orgId: string,
    content: string,
    createInviteDto: CreateInviteDto,
    email: string,
  ): Promise<Invite> {
    const { receiverId } = createInviteDto;
    const newInvite = await this.inviteModel.create({
      senderId: userId,
      receiverId,
      emailReceiver: email,
      content,
      orgId,
    });
    return newInvite;
  }

  async getInviteById(id: string): Promise<Invite> {
    const invite = await this.inviteModel.findById(id).exec();
    if (!invite) throw new NotFoundException(`Invite id ${id} not found`);
    return invite;
  }

  async getInvitesByOrgIdAndReceiverId(orgId: string, receiverId: string) {
    const invites = await this.inviteModel.find({ orgId, receiverId }).exec();
    return invites;
  }

  async updateInvite(id: string, accepted: boolean): Promise<Invite> {
    const invite = await this.inviteModel
      .findByIdAndUpdate(id, { $set: { accepted: accepted } }, { new: true })
      .exec();
    if (!invite) throw new NotFoundException(`Invite id ${id} not found`);
    return invite;
  }
}
