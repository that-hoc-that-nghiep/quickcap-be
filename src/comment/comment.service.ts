import { Injectable } from '@nestjs/common';
import { CommentRepository } from './comment.repository';

@Injectable()
export class CommentService {
  constructor(private commentRepository: CommentRepository) {}

  async createComment(videoId: string, userId: string, content: string) {
    const comment = await this.commentRepository.createComment(
      videoId,
      userId,
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
