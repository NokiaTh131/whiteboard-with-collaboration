import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { BoardService } from 'src/board/board.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class PermissionService {
  constructor(
    @Inject(forwardRef(() => BoardService))
    private readonly boardService: BoardService,
    private readonly userService: UserService,
  ) {}
  async canAccessBoard(userId: string, boardId: string): Promise<boolean> {
    try {
      const board = await this.boardService.findById(boardId);

      if (!board) {
        return false;
      }

      // If board is public, allow access
      if (board.isPublic) {
        return true;
      }

      // Check if user is a board member
      const isMember = board.members.some(
        (member) => member.userId.toString() === userId,
      );

      return isMember;
    } catch (error) {
      console.error('Board access check failed', error);
      return false;
    }
  }

  async canEditBoard(userId: string, boardId: string): Promise<boolean> {
    try {
      const board = await this.boardService.findById(boardId);
      if (!board) {
        return false;
      }

      // Find user's role in the board
      const memberRole = board.members.find(
        (member) => member.userId.toString() === userId,
      )?.role;

      // Only owners and editors can edit
      return memberRole === 'owner' || memberRole === 'editor';
    } catch (error) {
      console.error('Board edit permission check failed', error);
      return false;
    }
  }

  // Check if user can delete a board
  async canDeleteBoard(userId: string, boardId: string): Promise<boolean> {
    try {
      const board = await this.boardService.findById(boardId);

      if (!board) {
        return false;
      }

      // Only board owner can delete
      return board.owner.toString() === userId;
    } catch (error) {
      console.error('Board delete permission check failed', error);
      return false;
    }
  }

  // Add user or Change role to board with specific role
  async addUserToBoard(
    boardId: string,
    userId: string,
    role: 'owner' | 'editor' | 'viewer' = 'viewer',
  ): Promise<boolean> {
    try {
      const board = await this.boardService.findById(boardId);
      const user = await this.userService.findById(userId);

      if (!board || !user) {
        return false;
      }
      // Check if user is already a member
      const existingMember = board.members.find(
        (member) => member.userId.toString() === userId.toString(),
      );

      console.log(existingMember);
      if (existingMember) {
        // Update existing member's role
        console.log('updated role');
        existingMember.role = role;
      } else {
        // Add new member
        board.members.push({
          userId: new Types.ObjectId(userId),
          role,
        });
      }

      await board.save();
      return true;
    } catch (error) {
      console.error('Adding user to board failed', error);
      return false;
    }
  }

  // Remove user from board
  async removeUserFromBoard(boardId: string, userId: string): Promise<boolean> {
    try {
      const board = await this.boardService.findById(boardId);

      if (!board) {
        return false;
      }
      // Remove user from members
      board.members = board.members.filter(
        (member) => member.userId.toString() !== userId.toString(),
      );

      await board.save();
      return true;
    } catch (error) {
      console.error('Removing user from board failed', error);
      return false;
    }
  }
}
