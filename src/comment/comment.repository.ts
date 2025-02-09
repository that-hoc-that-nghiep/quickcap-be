import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './comment.schema';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) {}

  //   async createComment(videoId: string, userId: string, content: string) {
  //     const comment = await this.commentModel.create({
  //       content,
  //       videoId,
  //       userId,
  //     });
  //     return comment;
  //   }

  //   async addReplyComment(parent_id: string, reply_id: string) {
  //     return await this.commentModel.findByIdAndUpdate(parent_id, {
  //       $push: {
  //         child_id: reply_id,
  //       },
  //     });
  //   }
}
