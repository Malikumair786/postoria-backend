import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  UseGuards,
  Logger,
  Res,
  HttpStatus,
  Param,
  Put,
  BadRequestException,
  Delete,
  ForbiddenException
} from '@nestjs/common';
import { ApiResponse } from 'src/common/api-response';
import { ResponseCodes } from 'src/common/response-codes.enum';
import { Request, Response } from 'express';

import { PostsService } from 'src/service/posts.service';
import { CreatePostDto } from 'src/dto/post/create-post.dto';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { EditPostDto } from 'src/dto/post/edit-post.dto';

@Controller('posts')
@UseGuards(JwtAuthGuard) // applies JWT guard to all routes by default
export class PostsController {
  private logger = new Logger(PostsController.name);

  constructor(private readonly postsService: PostsService) {}

  @Post()
  async createPost(@Body() dto: CreatePostDto, @Req() req, @Res() res: Response) {
    const userId = req.user.userId;
    this.logger.log(`Create post request received from user: ${userId}`);
    try {
      this.logger.log('Attempting to create post...');
      const createdPost = await this.postsService.createPost(userId, dto);
      this.logger.log(`Post created successfully by user: ${userId}`);
      return res.status(HttpStatus.CREATED).json(new ApiResponse(true, ResponseCodes.POST_CREATED, 'Post created successfully', createdPost));
    } catch (error) {
      this.logger.error(`Failed to create post for user: ${userId} - ${error.message}`);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ApiResponse(false, ResponseCodes.GENERIC_INTERNAL_SERVER_ERROR, 'Internal Server Error'));
    }
  }

  @Get('feed')
  async getFeed(@Res() res: Response) {
    this.logger.log('Fetching post feed');
    try {
      const posts = await this.postsService.getFeed();
      return res.status(HttpStatus.OK).json(
        new ApiResponse(true, ResponseCodes.GENERIC_OK, 'Posts fetched successfully', posts)
      );
    } catch (err) {
      this.logger.error(`Failed to fetch post feed: ${err.message}`);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ApiResponse(false, ResponseCodes.GENERIC_INTERNAL_SERVER_ERROR, 'Server error'));
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-feeds')
  async getUserFeeds(@Req() req: any, @Res() res: Response) {
    const userId = req.user?.userId;
    this.logger.log(`[getUserFeeds] Received request to fetch feeds for userId: ${userId}`);
    try {
      const feeds = await this.postsService.getUserFeeds(userId);
      this.logger.log(`[getUserFeeds] Successfully fetched ${feeds.length} feed(s) for userId: ${userId}`);
      return res.status(HttpStatus.OK).json(new ApiResponse(true, ResponseCodes.GENERIC_OK, 'User feeds fetched successfully', feeds));
    } catch (err) {
      this.logger.error(`[getUserFeeds] Error occurred while fetching feeds for userId: ${userId}`, err.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ApiResponse(false, ResponseCodes.GENERIC_INTERNAL_SERVER_ERROR, 'Failed to fetch user feeds'));
    }
  }

  @Put(':id')
  async editPost(@Param('id') id: string,@Body() dto: EditPostDto,@Req() req,) {
    const userId = req.user.userId; // Get userId from JWT token
    this.logger.log(`Request to edit post with ID: ${id} by user: ${userId}`);
    
    try {
      // Check if the user is the owner of the post
      const post = await this.postsService.findPostById(id);
      if (post.userId !== userId) {
        this.logger.warn(`User ${userId} tried to edit a post that does not belong to them.`);
        throw new ForbiddenException('You do not have permission to edit this post.');
      }

      const updatedPost = await this.postsService.editPost(userId, id, dto.text, dto.imageUrls);
      return { message: 'Post updated successfully', post: updatedPost };
    } catch (err) {
      this.logger.error(`Failed to update post with ID: ${id}`, err.stack);
      throw new BadRequestException('Failed to update the post');
    }
  }

  // Hide post
  @UseGuards(JwtAuthGuard)
  @Put('hide/:id')
  async hidePost(@Param('id') id: string, @Req() req) {
    const userId = req.user.userId;
    this.logger.log(`Request to hide post with ID: ${id} by user: ${userId}`);

    try {
      const post = await this.postsService.findPostById(id);
      if (post.userId !== userId) {
        this.logger.warn(`User ${userId} tried to hide a post that does not belong to them.`);
        throw new ForbiddenException('You do not have permission to hide this post.');
      }

      const hiddenPost = await this.postsService.hidePost(userId, id);
      return { message: 'Post hidden successfully', post: hiddenPost };
    } catch (err) {
      this.logger.error(`Failed to hide post with ID: ${id}`, err.stack);
      throw new BadRequestException('Failed to hide the post');
    }
  }

  // Delete post
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePost(@Param('id') id: string, @Req() req) {
    const userId = req.user.userId;
    this.logger.log(`Request to delete post with ID: ${id} by user: ${userId}`);

    try {
      // Check if the user is the owner of the post
      const post = await this.postsService.findPostById(id);
      if (post.userId !== userId) {
        this.logger.warn(`User ${userId} tried to delete a post that does not belong to them.`);
        throw new ForbiddenException('You do not have permission to delete this post.');
      }

      const message = await this.postsService.deletePost(userId, id);
      return { message };
    } catch (err) {
      this.logger.error(`Failed to delete post with ID: ${id}`, err.stack);
      throw new BadRequestException('Failed to delete the post');
    }
  }
}
