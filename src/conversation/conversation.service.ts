import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { VideoRepository } from 'src/video/video.repository';
import { ConversationRepository } from './conversation.repository';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ConversationService {
  constructor(
    @Inject('quickcap-ai') private client: ClientProxy,
    private videoRepository: VideoRepository,
    private conversationRepository: ConversationRepository,
  ) {}
  private readonly logger = new Logger(ConversationService.name);
  async createConversation(userId: string, videoId: string, question: string) {
    this.logger.log('Start create conversation');
    const transcript = (await this.videoRepository.getVideoById(videoId))
      .transcript;
    const conversation = await this.conversationRepository.getConversations(
      userId,
      videoId,
    );
    const conversationReq = conversation.map((c) => {
      return {
        role: c.role,
        content: c.content,
      };
    });
    console.log('conversation request', conversationReq);
    this.logger.log("Send {cmd: 'chat'}");
    const response = await firstValueFrom(
      this.client.send(
        { cmd: 'chat' },
        {
          question,
          conversation: conversationReq,
          transcript,
        },
      ),
    );
    this.logger.log('Api create conversation in database');
    const neWconversation =
      await this.conversationRepository.createConversation(
        userId,
        videoId,
        question,
        response.response,
      );
    this.logger.log('Start create conversation', neWconversation);
    return {
      data: neWconversation,
      message: 'Conversation created successfully',
    };
  }

  async getConversations(userId: string, videoId: string) {
    const conversations = await this.conversationRepository.getConversations(
      userId,
      videoId,
    );
    this.logger.log('Get all conversation', conversations);
    return {
      data: conversations,
      message: 'Conversations fetched successfully',
    };
  }

}
