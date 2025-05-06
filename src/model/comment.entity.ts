import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Comment extends Document {
  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  text: string;

  @Prop({ default: 0 })
  likes: number;

  @Prop({ type: Types.ObjectId, ref: 'Comment', default: null })
  parentCommentId: string | null; // For replies
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
