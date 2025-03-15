import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './comment.schema';
import { User } from 'src/constants/user';
import { UserComment } from './dto/user-comment.dto';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) {}

  async createComment(videoId: string, user: User, content: string) {
    const userComment: UserComment = {
      id: user.id,
      email: user.email,
      name: user.name,
      given_name: user.given_name,
      family_name: user.family_name,
      picture: user.picture,
      subscription: user.subscription,
      timestamp: new Date().toISOString(),
    };
    const comment = await this.commentModel.create({
      content,
      videoId,
      userComment,
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
