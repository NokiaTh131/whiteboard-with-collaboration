import express from "express";
import { BoardController } from "../controllers/boardController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();
const boardController = new BoardController();

// Create a new board
router.post("/", authMiddleware, (req, res) =>
  boardController.createBoard(req, res)
);

// Get user's boards
router.get("/", authMiddleware, (req, res) =>
  boardController.getUserBoards(req, res)
);

// Get specific board details
router.get("/:boardId", authMiddleware, (req, res) =>
  boardController.getBoardDetails(req, res)
);

// Update board settings
router.put("/:boardId", authMiddleware, (req, res) =>
  boardController.updateBoard(req, res)
);

// Delete a board
router.delete("/:boardId", authMiddleware, (req, res) =>
  boardController.deleteBoard(req, res)
);

// Invite user to board
router.post("/:boardId/invite", authMiddleware, (req, res) =>
  boardController.inviteUserToBoard(req, res)
);

export default router;
