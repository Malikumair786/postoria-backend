import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from 'src/model/comment.entity';

@Injectable()
export class CommentService {
  private logger = new Logger(CommentService.name);

  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<Comment>,
  ) {}

  async addComment(postId: string, userId: string, text: string, parentCommentId?: string): Promise<Comment> {
    this.logger.log(`Adding comment by user ${userId} on post ${postId}`);
    try {
      const newComment = new this.commentModel({ postId, userId, text, parentCommentId: parentCommentId || null });
      return await newComment.save();
    } catch (err) {
      this.logger.error(`Failed to add comment: ${err.message}`);
      throw new InternalServerErrorException('Failed to add comment');
    }
  }

  async likeComment(commentId: string): Promise<Comment> {
    this.logger.log(`Liking comment ${commentId}`);
    try {
      return await this.commentModel.findByIdAndUpdate(
        commentId,
        { $inc: { likes: 1 } },
        { new: true },
      );
    } catch (err) {
      this.logger.error(`Failed to like comment: ${err.message}`);
      throw new InternalServerErrorException('Failed to like comment');
    }
  }

  async getMostLikedComment(postId: string): Promise<Comment | null> {
    this.logger.log(`Fetching most liked comment for post ${postId}`);
    try {
      return await this.commentModel
        .findOne({ postId })
        .sort({ likes: -1 })
        .lean();
    } catch (err) {
      this.logger.error(`Error fetching most liked comment for post ${postId}: ${err.message}`);
      return null;
    }
  }
}
