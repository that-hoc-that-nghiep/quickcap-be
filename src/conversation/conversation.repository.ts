import { Injectable } from '@nestjs/common';
import { Conversation } from './conversation.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { RoleChat } from 'src/constants/conversation';

@Injectable()
export class ConversationRepository {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<Conversation>,
  ) {}

  async createConversation(
    userId: string,
    videoId: string,
    question: string,
    contentAi: string,
  ) {
    const newConversation = await this.conversationModel.insertMany([
      {
        role: RoleChat.USER,
        content: question,
        videoId: videoId,
        userId: userId,
      },
      {
        role: RoleChat.AI,
        content: contentAi,
        videoId: videoId,
        userId: userId,
      },
    ]);
    return newConversation;
  }

  async getConversations(userId: string, videoId: string) {
    const conversations = await this.conversationModel.find({
      userId: userId,
      videoId: videoId,
    });
    return conversations;
  }
}
