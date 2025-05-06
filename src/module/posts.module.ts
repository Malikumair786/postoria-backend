import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsService } from 'src/service/posts.service';
import { PostsController } from 'src/controller/posts.controller';
import { Post, PostSchema } from 'src/model/post.entity';
import { CommentModule } from './comment.module';
import { UserModule } from './user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    CommentModule, // Add CommentModule here
    UserModule
  ],
  providers: [PostsService],
  controllers: [PostsController],
})
export class PostsModule {}
