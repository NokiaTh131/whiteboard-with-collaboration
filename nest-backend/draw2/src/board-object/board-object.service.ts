import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BoardObject, BoardObjectDocument } from './schemas/boardObject.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class BoardObjectService {
  constructor(
    @InjectModel(BoardObject.name)
    private readonly boardObjectModel: Model<BoardObjectDocument>,
  ) {}

  async create(data: Partial<BoardObject>) {
    const newObject = new this.boardObjectModel(data);
    await newObject.save();
    return newObject;
  }

  async findById(boardId: string) {
    return this.boardObjectModel
      .find({
        boardId: new Types.ObjectId(boardId),
      })
      .populate('createdBy', 'username');
  }

  async findByObjectPreviousState(objectId: string) {
    return this.boardObjectModel
      .findById(new Types.ObjectId(objectId))
      .select('width height x y fill -_id');
  }

  async deleteMany(boardId: string) {
    return this.boardObjectModel.deleteMany({
      boardId: new Types.ObjectId(boardId),
    });
  }

  async findByIdAndUpdate(objectId: string, updates: any) {
    return this.boardObjectModel.findByIdAndUpdate(
      objectId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      {
        ...updates,
      },
      { new: true },
    );
  }

  async findByIdAndDelete(objectId: string) {
    return this.boardObjectModel.findByIdAndDelete(objectId);
  }
}
