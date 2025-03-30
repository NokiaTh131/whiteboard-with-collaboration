import { Request, Response } from "express";
import { Board } from "../models/Board";
import { User } from "../models/User";
import { BoardObject } from "../models/BoardObject";
import { PermissionService } from "../services/permissionService";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { Types } from "mongoose";

export class BoardController {
  private permissionService: PermissionService;

  constructor() {
    this.permissionService = new PermissionService();
  }

  // Create a new board
  async createBoard(req: AuthenticatedRequest, res: Response) {
    try {
      const { title, isPublic = false, backgroundColor } = req.body;
      const userId = req.user.id;

      const newBoard = new Board({
        title,
        owner: userId,
        isPublic,
        backgroundColor,
        members: [
          {
            userId: userId,
            role: "owner",
          },
        ],
      });

      await newBoard.save();

      // Update user's boards
      await User.findByIdAndUpdate(userId, { $push: { boards: newBoard._id } });

      res.status(201).json(newBoard);
    } catch (error) {
      res.status(500).json({ message: "Board creation failed", error });
    }
  }

  // Get user's boards
  async getUserBoards(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user.id;

      // Find boards where user is a member
      const boards = await Board.find({
        "members.userId": userId as Types.ObjectId,
      });

      res.json(boards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch boards", error });
    }
  }

  // Get specific board details
  async getBoardDetails(req: AuthenticatedRequest, res: Response) {
    try {
      const boardId = req.params.boardId;
      const userId = req.user.id;

      // Check board access permissions
      const canAccess = await this.permissionService.canAccessBoard(
        userId,
        boardId
      );

      if (!canAccess) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      // Fetch board with populated objects
      const board = await Board.findById(boardId)
        .populate("owner", "username")
        .populate("members.user", "username");

      const boardObjects = await BoardObject.find({
        board: boardId,
      }).populate("createdBy", "username");

      res.json({
        board,
        objects: boardObjects,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch board details", error });
    }
  }

  // Update board settings
  async updateBoard(req: AuthenticatedRequest, res: Response) {
    try {
      const boardId = req.params.boardId;
      const userId = req.user.id;
      const updates = req.body;

      // Check edit permissions
      const canEdit = await this.permissionService.canEditBoard(
        userId,
        boardId
      );

      if (!canEdit) {
        res.status(403).json({ message: "Edit permission denied" });
        return;
      }

      const updatedBoard = await Board.findByIdAndUpdate(boardId, updates, {
        new: true,
      });

      res.json(updatedBoard);
    } catch (error) {
      res.status(500).json({ message: "Board update failed", error });
    }
  }

  // Delete a board
  async deleteBoard(req: AuthenticatedRequest, res: Response) {
    try {
      const boardId = req.params.boardId;
      const userId = req.user.id;

      // Check delete permissions
      const canDelete = await this.permissionService.canDeleteBoard(
        userId,
        boardId
      );

      if (!canDelete) {
        res.status(403).json({ message: "Delete permission denied" });
        return;
      }

      // Delete board and associated objects
      await Board.findByIdAndDelete(boardId);
      await BoardObject.deleteMany({ board: boardId });

      res.json({ message: "Board deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Board deletion failed", error });
    }
  }

  // Invite user to board
  async inviteUserToBoard(req: AuthenticatedRequest, res: Response) {
    try {
      const boardId = req.params.boardId;
      const { email, role = "viewer" } = req.body;
      const inviterId = req.user.id;

      // Find user by email
      const user = await User.findOne({ email });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Check if inviter has permission to add members
      const canEdit = await this.permissionService.canEditBoard(
        inviterId,
        boardId
      );

      if (!canEdit) {
        res.status(403).json({ message: "Permission denied" });
        return;
      }

      // Add user to board
      const added = await this.permissionService.addUserToBoard(
        boardId,
        user._id as string,
        role
      );

      if (added) {
        res.status(200).json({ message: "User invited successfully" });
      } else {
        res.status(500).json({ message: "Invitation failed" });
      }
    } catch (error) {
      res.status(500).json({ message: "Invitation process failed", error });
    }
  }
}
