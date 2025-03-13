import { Inject, Injectable } from '@nestjs/common';
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

  async createConversation(userId: string, videoId: string, question: string) {
    const transcript = (await this.videoRepository.getVideoById(videoId))
      .transcript;
    const conversation =
      await this.conversationRepository.getConversations(userId,videoId);

    const response = await firstValueFrom(
      this.client.send(
        { cmd: 'chat' },
        {
          question,
          conversation,
          transcript,
        },
      ),
    );
    const neWconversation =
      await this.conversationRepository.createConversation(
        userId,
        videoId,
        question,
        response.response,
      );
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
    return {
      data: conversations,
      message: 'Conversations fetched successfully',
    };
  }

  async test() {
    console.log('test conversation');
    this.client
      .send(
        { cmd: 'chat' },
        {
          question: 'thế cấu trúc câu phủ định là gìgì',
          conversation: [],
          transcript:
            'Hello mọi người. Hello, hello, hello, hello. Hello mọi người nhiều và hello mọi người không nhiều. Hello đây là một cái buổi, nói chung là đây là một cái bài sẵn liên quan đến tiếng Nhật, bao gồm là câu khẳng định và câu phủ định. Thì trong đó là câu khẳng định thì sẽ là từ cái hệ của v cộng với max, ví dụ như là, tức là x cộng v cộng max. Ví dụ như là, tôi đến từ Việt Nam đi thì, Tôi đã đến từ Việt Nam đi. thì là, Cách này là bài sẵn liên quan đến tiếng Nhật nha, liên quan đến câu khẳng định ở trong tiếng Nhật và liên quan đến câu phủ định trong tiếng Nhật.',
        },
      )
      .subscribe((res) => {
        console.log('Res from chat ai', res);
      });
  }
}
