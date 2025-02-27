import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CommentService } from './comment.service';
import { ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { GetUser } from 'src/decorators/get-user.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentResDto } from './dto/comment-res.dto';
import { CommentsResDto } from './dto/comments-res.dto';

@ApiSecurity('token')
@Controller('comment')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Post(':videoId')
  @ApiOperation({ summary: 'Create a comment' })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
    type: CommentResDto,
  })
  createComment(
    @Param('videoId') videoId: string,
    @GetUser('id') userId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const { content } = createCommentDto;
    const comment = this.commentService.createComment(videoId, userId, content);
    return comment;
  }

  @Get(':videoId')
  @ApiOperation({ summary: 'Get comments by videoId' })
  @ApiResponse({
    status: 200,
    description: 'Comments retrieved successfully',
    type: CommentsResDto,
  })
  getCommentsByVideoId(@Param('videoId') videoId: string) {
    const comments = this.commentService.getCommentsByVideoId(videoId);
    return comments;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({
    status: 200,
    description: 'Comment deleted successfully',
    type: CommentResDto,
  })
  deleteCommentById(@Param('id') id: string) {
    const comment = this.commentService.deleteCommentById(id);
    return comment;
  }
}
