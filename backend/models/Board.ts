import mongoose, { Schema, Document, Types } from "mongoose";

export interface IBoard extends Document {
  title: string;
  owner: Types.ObjectId;
  members: Array<{
    userId: Types.ObjectId;
    role: "owner" | "editor" | "viewer";
  }>;
  isPublic: boolean;
  backgroundColor: string;
  thumbnail?: string;
}

const BoardSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["owner", "editor", "viewer"],
          default: "viewer",
        },
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    backgroundColor: {
      type: String,
      default: "#FFFFFF",
    },
    thumbnail: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Board = mongoose.model<IBoard>("Board", BoardSchema);
