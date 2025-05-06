import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Like, LikeSchema } from 'src/model/like.entity';
import { LikeService } from 'src/service/like.service';
import { LikeController } from 'src/controller/like.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }])],
  controllers: [LikeController],
  providers: [LikeService],
  exports: [LikeService], // Optional, if used in other modules
})
export class LikeModule {}
