import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  Post,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';
import { GetUser } from 'src/decorators/get-user.decorator';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { ConversationsResDto } from './dto/conversations-res.dto';

@Controller('conversation')
@ApiSecurity('token')
export class ConversationController {
  constructor(private conversationService: ConversationService) {}
  private logger = new Logger(ConversationController.name);
  @Post(':videoId')
  @ApiOperation({ summary: 'Create conversation' })
  @ApiParam({ name: 'videoId', type: 'string' })
  @ApiBody({
    type: CreateConversationDto,
    examples: {
      example1: {
        value: {
          question: 'Ý chính của video là gì?',
        },
      },
    },
  })
  @ApiResponse({ status: 201, type: ConversationsResDto })
  createConversation(
    @GetUser('id') userId: string,
    @Param('videoId') videoId: string,
    @Body() createConversationDto: CreateConversationDto,
  ) {
    try {
      return this.conversationService.createConversation(
        userId,
        videoId,
        createConversationDto.question,
      );
    } catch (error) {
      this.logger.error('Error create conversation');
      throw new InternalServerErrorException(error);
    }
  }

  @Get(':videoId')
  @ApiOperation({ summary: 'Get all conversations' })
  @ApiResponse({ status: 200, type: ConversationsResDto })
  @ApiParam({ type: 'string', name: 'videoId' })
  getConversations(
    @GetUser('id') userId: string,
    @Param('videoId') videoId: string,
  ) {
    try {
      return this.conversationService.getConversations(userId, videoId);
    } catch (error) {
      this.logger.error('Error get conversations');
      throw new InternalServerErrorException(error);
    }
  }
}
