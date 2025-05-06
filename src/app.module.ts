import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './module/user.module';
import { AuthModule } from './module/auth.module';
import { PostsModule } from './module/posts.module';
import { CommentModule } from './module/comment.module';
import { LikeModule } from './module/like.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // makes ConfigModule globally available
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    UserModule, 
    AuthModule,
    PostsModule,
    CommentModule,
    LikeModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
