import { Board } from "../models/Board";
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authMiddleware";
export const checkBoardPermission = (
  requiredRole: "owner" | "editor" | "viewer"
) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const boardId = req.params.boardId;
      const user = req.user;

      const board = await Board.findById(boardId);

      if (!board) {
        return res.status(404).json({ error: "Board not found" });
      }

      const memberAccess = board.members.find(
        (member) => member.userId.toString() === user._id.toString()
      );

      const permissionHierarchy = {
        owner: 3,
        editor: 2,
        viewer: 1,
      };

      if (
        !memberAccess ||
        permissionHierarchy[memberAccess.role] <
          permissionHierarchy[requiredRole]
      ) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: "Permission check failed" });
    }
  };
};
