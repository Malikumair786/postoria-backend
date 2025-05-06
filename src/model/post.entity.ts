import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Post extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop()
  text: string;

  @Prop({ type: [String], default: [] })
  imageUrls: string[];

  @Prop({ default: 0 })
  likeCount: number;

  @Prop({ default: 0 })
  commentCount: number;

  @Prop({ default: false })
  hidden: boolean;
}

export const PostSchema = SchemaFactory.createForClass(Post);
