import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  Post,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { GetUser } from 'src/decorators/get-user.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentResDto } from './dto/comment-res.dto';
import { CommentsResDto } from './dto/comments-res.dto';
import { User } from 'src/constants/user';

@ApiSecurity('token')
@Controller('comment')
export class CommentController {
  constructor(private commentService: CommentService) {}
  private logger = new Logger(CommentController.name);
  @Post(':videoId')
  @ApiOperation({ summary: 'Create a comment' })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
    type: CommentResDto,
  })
  createComment(
    @Param('videoId') videoId: string,
    @GetUser() user: User,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    try {
      const { content } = createCommentDto;
      const comment = this.commentService.createComment(videoId, user, content);
      return comment;
    } catch (error) {
      this.logger.error('Error create comment');
      throw new InternalServerErrorException(error);
    }
  }

  @Get(':videoId')
  @ApiOperation({ summary: 'Get comments by videoId' })
  @ApiResponse({
    status: 200,
    description: 'Comments retrieved successfully',
    type: CommentsResDto,
  })
  getCommentsByVideoId(@Param('videoId') videoId: string) {
    try {
      const comments = this.commentService.getCommentsByVideoId(videoId);
      return comments;
    } catch (error) {
      this.logger.error('Error get comments by videoId');
      throw new InternalServerErrorException(error);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({
    status: 200,
    description: 'Comment deleted successfully',
    type: CommentResDto,
  })
  deleteCommentById(@Param('id') id: string) {
    try {
      const comment = this.commentService.deleteCommentById(id);
      return comment;
    } catch (error) {
      this.logger.error('Error delete comment');
      throw new InternalServerErrorException(error);
    }
  }
}
