import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './comment.schema';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) {}

  async createComment(videoId: string, userId: string, content: string) {
    const comment = await this.commentModel.create({
      content,
      videoId,
      userId,
    });
    return comment;
  }

  async getCommentsByVideoId(videoId: string) {
    const comments = await this.commentModel.find({ videoId });
    return comments;
  }

  async deleteCommentById(id: string) {
    const comment = await this.commentModel
      .findByIdAndUpdate(
        id,
        {
          $set: { isDeleted: true },
        },
        {
          new: true,
        },
      )
      .exec();
    if (!comment) throw new NotFoundException(`Comment id ${id} not found`);
    return comment;
  }
}
