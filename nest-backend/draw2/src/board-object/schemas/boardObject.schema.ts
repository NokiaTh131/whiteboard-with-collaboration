import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as TypeSchema } from 'mongoose';

type Color = {
  r: number;
  g: number;
  b: number;
};

export type BoardObjectDocument = BoardObject & Document;

@Schema({ timestamps: true })
export class BoardObject extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Board', required: true })
  boardId: Types.ObjectId;

  @Prop({ required: true, type: TypeSchema.Types.Mixed })
  type: any;

  @Prop({ required: true })
  x: number;

  @Prop({ required: true })
  y: number;

  @Prop({ required: true })
  width: number;

  @Prop({ required: true })
  height: number;

  @Prop({
    type: {
      r: { type: Number, required: true },
      g: { type: Number, required: true },
      b: { type: Number, required: true },
    },
    required: true,
  })
  fill: Color;

  @Prop({ type: [[Number]], required: false }) // Array of coordinate pairs
  points?: number[][];

  @Prop({ type: Number, required: false, default: 3 })
  strokeWidth?: number;

  @Prop({ required: false })
  value?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

export const BoardObjectSchema = SchemaFactory.createForClass(BoardObject);
