// like.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Like extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  targetId: string; // Can be postId or commentId

  @Prop({ required: true, enum: ['post', 'comment'] })
  targetType: 'post' | 'comment';
}

export const LikeSchema = SchemaFactory.createForClass(Like);
