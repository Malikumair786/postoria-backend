import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Like } from 'src/model/like.entity';

@Injectable()
export class LikeService {
  private logger = new Logger(LikeService.name);

  constructor(@InjectModel(Like.name) private likeModel: Model<Like>) {}

  async toggleLike(
    userId: string,
    targetId: string,
    targetType: 'post' | 'comment'
  ): Promise<{ liked: boolean }> {
    this.logger.log(`User ${userId} toggling like on ${targetType} ${targetId}`);

    try {
      const existing = await this.likeModel.findOne({ userId, targetId, targetType });

      if (existing) {
        await this.likeModel.deleteOne({ _id: existing._id });
        this.logger.log(`User ${userId} removed like from ${targetType} ${targetId}`);
        return { liked: false };
      }

      await this.likeModel.create({ userId, targetId, targetType });
      this.logger.log(`User ${userId} liked ${targetType} ${targetId}`);
      return { liked: true };
    } catch (error) {
      this.logger.error(
        `Failed to toggle like for user ${userId} on ${targetType} ${targetId}: ${error.message}`
      );
      throw new InternalServerErrorException('Failed to toggle like');
    }
  }

  async countLikes(targetId: string, targetType: 'post' | 'comment'): Promise<number> {
    this.logger.log(`Counting likes on ${targetType} ${targetId}`);

    try {
      const count = await this.likeModel.countDocuments({ targetId, targetType });
      this.logger.log(`Total likes for ${targetType} ${targetId}: ${count}`);
      return count;
    } catch (error) {
      this.logger.error(
        `Failed to count likes for ${targetType} ${targetId}: ${error.message}`
      );
      throw new InternalServerErrorException('Failed to count likes');
    }
  }

  async getLikers(targetId: string, targetType: 'post' | 'comment') {
    this.logger.log(`Fetching likers of ${targetType} ${targetId}`);

    try {
      const likers = await this.likeModel.find({ targetId, targetType }).lean();
      this.logger.log(
        `Retrieved ${likers.length} likers for ${targetType} ${targetId}`
      );
      return likers;
    } catch (error) {
      this.logger.error(
        `Failed to get likers for ${targetType} ${targetId}: ${error.message}`
      );
      throw new InternalServerErrorException('Failed to fetch likers');
    }
  }
}
