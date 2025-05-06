import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePostDto } from 'src/dto/post/create-post.dto';
import { Post } from 'src/model/post.entity';
import { CommentService } from './comment.service';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    private readonly commentService: CommentService, // Inject CommentService here
  ) {}

  async createPost(userId: string, dto: CreatePostDto): Promise<Post> {
    this.logger.log(`Creating post for user: ${userId}`);
    try {
      const newPost = new this.postModel({
        userId,
        text: dto.text,
        imageUrls: dto.imageUrls, // assuming imageUrls is string[]
      });

      const savedPost = await newPost.save();

      this.logger.log(`Post created successfully with ID: ${savedPost._id} for user: ${userId}`);
      return savedPost;
    } catch (error) {
      this.logger.error(`Failed to create post for user ${userId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create post');
    }
  }

  async getFeed(): Promise<any[]> {
    this.logger.log('Starting feed retrieval process...');
    try {
      this.logger.log('Querying visible posts from database...');
      const posts: any = await this.postModel.find({ hidden: false }).sort({ createdAt: -1 }).lean();
  
      this.logger.log(`Fetched ${posts.length} posts. Retrieving most liked comments...`);
  
      for (const post of posts) {
        try {
          const mostLikedComment = await this.commentService.getMostLikedComment(post._id.toString());
          post.mostLikedComment = mostLikedComment || null;
        } catch (commentErr) {
          this.logger.error(`Failed to fetch most liked comment for post ${post._id}: ${commentErr.message}`);
          post.mostLikedComment = null;
        }
      }
      this.logger.log('Post feed prepared successfully');
      return posts;
    } catch (err) {
      this.logger.error(`Error while retrieving feed: ${err.message}`, err.stack);
      throw new InternalServerErrorException('Failed to retrieve post feed');
    }
  }

  async findPostById(postId: string): Promise<Post> {
    this.logger.log(`Finding post with ID: ${postId}`);
    try {
      const post = await this.postModel.findById(postId);
      if (!post) {
        this.logger.warn(`Post with ID: ${postId} not found.`);
        throw new NotFoundException('Post not found');
      }
      return post;
    } catch (err) {
      this.logger.error(`Failed to find post with ID: ${postId}`, err.stack);
      throw new InternalServerErrorException('Failed to find the post');
    }
  }

  async editPost(userId: string, postId: string, text: string, imageUrls: string[]): Promise<Post> {
    this.logger.log(`Editing post with ID: ${postId} by user: ${userId}`);

    try {
      const post = await this.postModel.findOne({ _id: postId, userId });
      if (!post) {
        this.logger.warn(`Post with ID: ${postId} not found or not owned by user ${userId}`);
        throw new NotFoundException('Post not found or you do not have permission to edit this post.');
      }

      post.text = text || post.text; // Allow partial updates
      post.imageUrls = imageUrls.length > 0 ? imageUrls : post.imageUrls;

      this.logger.log(`Post with ID: ${postId} updated successfully.`);
      return await post.save();
    } catch (err) {
      this.logger.error(`Failed to edit post with ID: ${postId}`, err.stack);
      throw new InternalServerErrorException('Failed to update the post.');
    }
  }

  async hidePost(userId: string, postId: string): Promise<Post> {
    this.logger.log(`Hiding post with ID: ${postId} by user: ${userId}`);

    try {
      const post = await this.postModel.findOne({ _id: postId, userId });
      if (!post) {
        this.logger.warn(`Post with ID: ${postId} not found or not owned by user ${userId}`);
        throw new NotFoundException('Post not found or you do not have permission to hide this post.');
      }

      post.hidden = true;
      this.logger.log(`Post with ID: ${postId} is now hidden.`);
      return await post.save();
    } catch (err) {
      this.logger.error(`Failed to hide post with ID: ${postId}`, err.stack);
      throw new InternalServerErrorException('Failed to hide the post.');
    }
  }

  async deletePost(userId: string, postId: string): Promise<string> {
    this.logger.log(`Deleting post with ID: ${postId} by user: ${userId}`);

    try {
      const post = await this.postModel.findOne({ _id: postId, userId });
      if (!post) {
        this.logger.warn(`Post with ID: ${postId} not found or not owned by user ${userId}`);
        throw new NotFoundException('Post not found or you do not have permission to delete this post.');
      }

      await this.postModel.deleteOne({ _id: postId });
      this.logger.log(`Post with ID: ${postId} deleted successfully.`);
      return `Post with ID: ${postId} deleted successfully.`;
    } catch (err) {
      this.logger.error(`Failed to delete post with ID: ${postId}`, err.stack);
      throw new InternalServerErrorException('Failed to delete the post.');
    }
  }
}
