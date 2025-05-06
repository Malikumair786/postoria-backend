import { Controller, Logger, Post, Body, Req, UseGuards, Res, HttpStatus } from '@nestjs/common';
import { LikeService } from 'src/service/like.service';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { Response } from 'express';
import { ApiResponse } from 'src/common/api-response';
import { ResponseCodes } from 'src/common/response-codes.enum';

@UseGuards(JwtAuthGuard)
@Controller('likes')
export class LikeController {
  private logger = new Logger(LikeController.name);

  constructor(private readonly likeService: LikeService) {}

  @Post()
  async toggleLike(
    @Req() req,
    @Body() body: { targetId: string; targetType: 'post' | 'comment' },
    @Res() res: Response,
  ) {
    const userId = req.user.userId;
    this.logger.log(`Received like toggle from user ${userId} for ${body.targetType} ${body.targetId}`);
    
    try {
      const result = await this.likeService.toggleLike(userId, body.targetId, body.targetType);
      return res.status(HttpStatus.OK).json(
        new ApiResponse(true, ResponseCodes.USER_SUCCESS, result.liked ? 'Liked' : 'Unliked'),
      );
    } catch (error) {
      this.logger.error(`Like toggle failed: ${error.message}`);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
        new ApiResponse(false, ResponseCodes.GENERIC_INTERNAL_SERVER_ERROR, 'Failed to toggle like'),
      );
    }
  }
}
