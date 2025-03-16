import { Injectable } from '@nestjs/common';
import { CommentRepository } from './comment.repository';
import { User } from 'src/constants/user';

@Injectable()
export class CommentService {
  constructor(private commentRepository: CommentRepository) {}

  async createComment(videoId: string, user: User, content: string) {
    const comment = await this.commentRepository.createComment(
      videoId,
      user,
      content,
    );
    return comment;
  }

  async getCommentsByVideoId(videoId: string) {
    const comments = await this.commentRepository.getCommentsByVideoId(videoId);
    return comments;
  }

  async deleteCommentById(id: string) {
    const comment = await this.commentRepository.deleteCommentById(id);
    return comment;
  }
}
