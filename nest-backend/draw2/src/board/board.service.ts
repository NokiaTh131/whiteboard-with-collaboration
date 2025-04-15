import {
  Injectable,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { Board, BoardDocument } from './schemas/board.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PermissionService } from 'src/permission/permission.service';
import { CreateBoardDto, InviteUserDto, UpdateBoardDto } from './dto/board.dto';
import { UserService } from 'src/user/user.service';
import { BoardObjectService } from 'src/board-object/board-object.service';

@Injectable()
export class BoardService {
  constructor(
    private permissionService: PermissionService,
    private userService: UserService,
    private boardObjectService: BoardObjectService,
    @InjectModel(Board.name) private readonly boardModel: Model<BoardDocument>,
  ) {}

  async findById(id: string) {
    return await this.boardModel.findById(id);
  }

  async createBoard(createBoardDto: CreateBoardDto, userId: string) {
    try {
      const newBoard = new this.boardModel({
        title: createBoardDto.title,
        owner: userId,
        isPublic: createBoardDto.isPublic,
        backgroundColor: createBoardDto.backgroundColor,
        members: [
          {
            userId: userId,
            role: 'owner',
          },
        ],
      });

      await newBoard.save();

      await this.userService.addBoardToUser(userId, newBoard._id as string);
      return newBoard;
    } catch (error) {
      if (error instanceof Error)
        throw new InternalServerErrorException('Board creation failed', error);
    }
  }

  async getUserBoards(userId: string) {
    try {
      // Find boards where user is a member
      const boards = await this.boardModel.find({
        'members.userId': new Types.ObjectId(userId),
      });

      return boards;
    } catch (error) {
      if (error instanceof Error)
        throw new InternalServerErrorException('Board retrieve failed', error);
    }
  }

  async getBoardDetails(boardId: string, userId: string) {
    try {
      // Check board access permissions
      const canAccess = await this.permissionService.canAccessBoard(
        userId,
        boardId,
      );

      if (!canAccess) {
        throw new ForbiddenException('Access permission denied');
      }

      // Fetch board with populated objects
      const board = await this.boardModel
        .findById(boardId)
        .populate('owner', 'username')
        .populate('members.userId', 'username');

      const boardObjects = await this.boardObjectService.findById(boardId);

      return {
        board,
        objects: boardObjects,
      };
    } catch (error) {
      if (error instanceof Error)
        throw new InternalServerErrorException(
          'Board retrieve failed',
          error.message,
        );
    }
  }

  async updateBoard(boardId: string, userId: string, updates: UpdateBoardDto) {
    try {
      // Check edit permissions
      const canEdit = await this.permissionService.canEditBoard(
        userId,
        boardId,
      );

      if (!canEdit) {
        throw new ForbiddenException('Update permission denied');
      }

      const updatedBoard = await this.boardModel.findByIdAndUpdate(
        boardId,
        updates,
        {
          new: true,
        },
      );

      return updatedBoard;
    } catch (error) {
      if (error instanceof Error)
        throw new InternalServerErrorException(
          'Board update failed',
          error.message,
        );
    }
  }

  async inviteUserToBoard(
    boardId: string,
    inviteUserDto: InviteUserDto,
    inviterId: string,
  ) {
    try {
      // Find user by email
      const user = await this.userService.findByEmail(inviteUserDto.email);

      if (!user) {
        throw new ForbiddenException('User not found');
      }

      // Check if inviter has permission to add members
      const canEdit = await this.permissionService.canEditBoard(
        inviterId,
        boardId,
      );

      if (!canEdit) {
        throw new ForbiddenException('Invited permission denied');
      }

      // Add user to board
      const added = await this.permissionService.addUserToBoard(
        boardId,
        user._id as string,
        inviteUserDto.role,
      );

      if (added) {
        return { message: 'User invited successfully' };
      } else {
        return { message: 'Invitation failed' };
      }
    } catch (error) {
      if (error instanceof Error)
        throw new InternalServerErrorException(
          'Board add user failed',
          error.message,
        );
    }
  }

  async removeUserFromBoard(
    boardId: string,
    userId: string,
    removerId: string,
  ) {
    try {
      const user = await this.userService.findById(userId);

      if (!user) {
        return { message: 'User not found' };
      }
      // Check if inviter has permission to remove members
      const canEdit = await this.permissionService.canEditBoard(
        removerId,
        boardId,
      );

      if (!canEdit) {
        throw new ForbiddenException('Remove permission denied');
      }

      // Add user to board
      const removed = await this.permissionService.removeUserFromBoard(
        boardId,
        user._id as string,
      );

      if (removed) {
        return { message: 'User removed successfully' };
      } else {
        return { message: 'remove failed' };
      }
    } catch (error) {
      if (error instanceof Error)
        throw new InternalServerErrorException(
          'Board remove failed',
          error.message,
        );
    }
  }

  async deleteBoard(boardId: string, userId: string) {
    try {
      // Check delete permissions
      const canDelete = await this.permissionService.canDeleteBoard(
        userId,
        boardId,
      );

      if (!canDelete) {
        throw new ForbiddenException('Delete permission denied');
      }

      // Delete board and associated objects
      await this.boardModel.findByIdAndDelete(boardId);
      await this.boardObjectService.deleteMany(boardId);

      return { message: 'Board deleted successfully' };
    } catch (error) {
      if (error instanceof Error)
        throw new InternalServerErrorException(
          'Board delete failed',
          error.message,
        );
    }
  }
}
