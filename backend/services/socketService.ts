import { Server, Socket } from "socket.io";
import { Board } from "../models/Board";
import { User } from "../models/User";
import { BoardObject } from "../models/BoardObject";
import { AuthService } from "./authService";
import { PermissionService } from "./permissionService";
import { BoardManager } from "./boardParticipants";

export class SocketService {
  private io: Server;
  private authService: AuthService;
  private permissionService: PermissionService;
  private boardManager: BoardManager;
  private cursors: Map<string, any>; // Store cursor positions by userId

  constructor(io: Server) {
    this.io = io;
    this.authService = new AuthService();
    this.permissionService = new PermissionService();
    this.boardManager = new BoardManager();
    this.cursors = new Map();
  }

  initializeSocketHandlers(socket: Socket) {
    // Authentication middleware
    socket.use(async (packet, next) => {
      const token = socket.handshake.auth.token;
      try {
        const decoded = await this.authService.verifyToken(token);
        socket.data.user = decoded;
        next();
      } catch (error) {
        next(new Error("Authentication error"));
      }
    });

    // Board-related events
    socket.on("board:join", this.handleBoardJoin.bind(this, socket));
    socket.on("board:update", this.handleBoardUpdate.bind(this, socket));
    socket.on("object:create", this.handleObjectCreate.bind(this, socket));
    socket.on("object:update", this.handleObjectUpdate.bind(this, socket));
    socket.on("object:delete", this.handleObjectDelete.bind(this, socket));

    // Cursor events
    socket.on("cursor:move", this.handleCursorMove.bind(this, socket));
    socket.on("cursor:leave", this.handleCursorLeave.bind(this, socket));

    socket.on("disconnect", () => {
      const boardId = socket.data.boardId; // Retrieve stored boardId
      const userId = socket.data.user?.id; // Retrieve userId

      if (boardId && userId) {
        try {
          // Remove participant
          this.boardManager.removeParticipant(boardId, userId);
          const participants = this.boardManager.getParticipants(boardId);

          // Notify all remaining users about the updated participants list
          this.io.to(boardId).emit("room", participants);

          // Remove cursor and notify others
          this.cursors.delete(userId);
          this.io.to(boardId).emit("cursor:leave", userId);

          console.log(
            `User ${userId} removed from board ${boardId} due to disconnect`
          );
        } catch {
          socket.emit("error", { message: "Failed to handle disconnect" });
        }
      }

      console.log("Client disconnected");
    });
  }

  private async handleBoardJoin(socket: Socket, boardId: string) {
    const userId = socket.data.user.id;
    socket.data.boardId = boardId;

    try {
      // Check board access permissions
      const hasAccess = await this.permissionService.canAccessBoard(
        userId,
        boardId
      );
      if (!hasAccess) {
        socket.emit("error", { message: "Access denied" });
        return;
      }
      // Join board room
      socket.join(boardId);

      // Fetch and send current board state
      const board = await Board.findById(boardId);
      const boardObjects = await BoardObject.find({ boardId: boardId });
      const user = await User.findById(userId);

      socket.emit("board:state", {
        board,
        objects: boardObjects,
      });

      // Add participant to board
      this.boardManager.addParticipant(boardId, {
        userId: userId,
        userName: user?.username || "Unknown user",
      });
      const participants = this.boardManager.getParticipants(boardId);

      // Send all current cursor positions to the new user
      for (const [cursorUserId, cursorData] of this.cursors.entries()) {
        if (cursorData.boardId === boardId && cursorUserId !== userId) {
          socket.emit("cursor:update", cursorData);
        }
      }

      this.io.to(boardId).emit("room", participants);
    } catch (error) {
      socket.emit("error", { message: "Failed to join board" });
    }
  }

  private handleCursorMove(socket: Socket, cursorData: any) {
    const userId = socket.data.user.id;
    const { boardId, position, username } = cursorData;

    // Create the cursor update object
    const cursorUpdate = {
      userId,
      username,
      position,
      boardId,
    };

    // Store the cursor position
    this.cursors.set(userId, cursorUpdate);

    // Broadcast to all users in the room except sender
    socket.to(boardId).emit("cursor:update", cursorUpdate);
  }

  private handleCursorLeave(socket: Socket, data: any) {
    const userId = socket.data.user.id;
    const { boardId } = data;

    // Remove cursor and notify others
    this.cursors.delete(userId);
    socket.to(boardId).emit("cursor:leave", userId);
  }

  private async handleBoardUpdate(socket: Socket, updateData: any) {
    const { boardId, updates } = updateData;
    const userId = socket.data.user.id;

    try {
      // Validate permissions
      const canEdit = await this.permissionService.canEditBoard(
        userId,
        boardId
      );
      if (!canEdit) {
        socket.emit("error", { message: "Edit permission denied" });
        return;
      }

      // Apply updates
      const updatedBoard = await Board.findByIdAndUpdate(boardId, updates, {
        new: true,
      });

      // Broadcast to other board members
      this.io.to(boardId).emit("board:updated", updatedBoard);
    } catch (error) {
      socket.emit("error", { message: "Board update failed" });
    }
  }

  private async handleObjectCreate(socket: Socket, objectData: any) {
    const { boardId, object } = objectData;
    const userId = socket.data.user.id;

    try {
      // Validate permissions
      const canEdit = await this.permissionService.canEditBoard(
        userId,
        boardId
      );
      if (!canEdit) {
        socket.emit("error", { message: "Edit permission denied" });
        return;
      }

      // Create new board object
      const newObject = new BoardObject({
        ...object,
        boardId: boardId,
        createdBy: userId,
      });
      await newObject.save();

      // Broadcast to all board members
      this.io.to(boardId).emit("object:created", newObject);
    } catch (error) {
      socket.emit("error", { message: "Object creation failed" });
    }
  }

  private async handleObjectUpdate(socket: Socket, updateData: any) {
    const { boardId, objectId, updates } = updateData;
    const userId = socket.data.user.id;

    try {
      // Validate permissions
      const canEdit = await this.permissionService.canEditBoard(
        userId,
        boardId
      );
      if (!canEdit) {
        socket.emit("error", { message: "Edit permission denied" });
        return;
      }

      // Update object
      const updatedObject = await BoardObject.findByIdAndUpdate(
        objectId,
        {
          ...updates,
        },
        { new: true }
      );

      // Broadcast to all board members
      this.io.to(boardId).emit("object:updated", updatedObject);
    } catch (error) {
      socket.emit("error", { message: "Object update failed" });
    }
  }

  private async handleObjectDelete(socket: Socket, deleteData: any) {
    const { boardId, objectId } = deleteData;
    const userId = socket.data.user.id;

    try {
      // Validate permissions
      const canEdit = await this.permissionService.canEditBoard(
        userId,
        boardId
      );
      if (!canEdit) {
        socket.emit("error", { message: "Edit permission denied" });
        return;
      }

      // Delete object
      await BoardObject.findByIdAndDelete(objectId);

      // Broadcast deletion to all board members
      this.io.to(boardId).emit("object:deleted", { objectId });
    } catch (error) {
      socket.emit("error", { message: "Object deletion failed" });
    }
  }
}
