import mongoose, { Schema, Document, Types } from "mongoose";

type Color = {
  r: number;
  g: number;
  b: number;
};
export interface IBoardObject extends Document {
  boardId: Types.ObjectId;
  type: any;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: Color;
  points?: number[][];
  value?: string;
  createdBy: Types.ObjectId;
}

const BoardObjectSchema: Schema = new Schema(
  {
    boardId: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
    type: {
      type: Schema.Types.Mixed,
      required: true,
    },

    x: {
      type: Number,
      required: true,
    },
    y: {
      type: Number,
      required: true,
    },
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    fill: {
      type: {
        r: { type: Number, required: true },
        g: { type: Number, required: true },
        b: { type: Number, required: true },
      },
      required: true,
    },
    points: {
      type: [[Number]], // Array of coordinate pairs
      required: false,
    },
    value: {
      type: String,
      required: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const BoardObject = mongoose.model<IBoardObject>(
  "BoardObject",
  BoardObjectSchema
);
