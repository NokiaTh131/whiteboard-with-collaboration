import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BoardDocument = Board & Document;

@Schema({ timestamps: true })
export class Board {
  @Prop({ required: true, trim: true, maxlength: 100 })
  title: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId;

  @Prop([
    {
      userId: { type: Types.ObjectId, ref: 'User' },
      role: {
        type: String,
        enum: ['owner', 'editor', 'viewer'],
        default: 'viewer',
      },
    },
  ])
  members: Array<{
    userId: Types.ObjectId;
    role: 'owner' | 'editor' | 'viewer';
  }>;

  @Prop({ default: false })
  isPublic: boolean;

  @Prop({ default: '#FFFFFF' })
  backgroundColor: string;

  @Prop()
  thumbnail?: string;
}

export const BoardSchema = SchemaFactory.createForClass(Board);
