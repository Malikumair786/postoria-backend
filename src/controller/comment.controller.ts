import { Controller, Post, Body, Param, Req, Logger, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { CommentService } from 'src/service/comment.service';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { Response } from 'express';
import { ApiResponse } from 'src/common/api-response';
import { ResponseCodes } from 'src/common/response-codes.enum';

@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentController {
  private logger = new Logger(CommentController.name);

  constructor(private readonly commentService: CommentService) {}

  @Post(':postId')
  async addComment(@Param('postId') postId: string, @Body() body: any, @Req() req, @Res() res: Response) {
    const { text, parentCommentId } = body;
    const userId = req.user.userId;
    this.logger.log(`User ${userId} is commenting on post ${postId}`);

    try {
      const comment = await this.commentService.addComment(postId, userId, text, parentCommentId);
      return res.status(HttpStatus.CREATED).json(
        new ApiResponse(true, ResponseCodes.USER_SUCCESS, 'Comment added', comment),
      );
    } catch (err) {
      this.logger.error(`Failed to comment on post ${postId}: ${err.message}`);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
        new ApiResponse(false, ResponseCodes.GENERIC_INTERNAL_SERVER_ERROR, 'Could not add comment'),
      );
    }
  }

  @Post('like/:commentId')
  async likeComment(@Param('commentId') commentId: string, @Res() res: Response) {
    try {
      const updated = await this.commentService.likeComment(commentId);
      return res.status(HttpStatus.OK).json(
        new ApiResponse(true, ResponseCodes.USER_SUCCESS, 'Comment liked', updated),
      );
    } catch (err) {
      this.logger.error(`Failed to like comment ${commentId}: ${err.message}`);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
        new ApiResponse(false, ResponseCodes.GENERIC_INTERNAL_SERVER_ERROR, 'Could not like comment'),
      );
    }
  }
}
