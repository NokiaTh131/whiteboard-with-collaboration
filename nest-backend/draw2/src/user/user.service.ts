/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email }).exec();
  }

  async findById(userId: string) {
    return await this.userModel.findById(userId);
  }

  async addBoardToUser(userId: string, boardId: string) {
    await this.userModel.findByIdAndUpdate(userId, {
      $push: { boards: boardId },
    });
  }

  async searchUsers(query: { email?: string }) {
    const filter: any = {};
    if (query.email) {
      filter.email = { $regex: query.email, $options: 'i' };
    }

    return this.userModel
      .find(filter)
      .select('username email')
      .limit(10)
      .exec();
  }
}
