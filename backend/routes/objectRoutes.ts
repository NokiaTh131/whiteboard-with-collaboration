import express from "express";
import { ObjectController } from "../controllers/objectController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();
const objectController = new ObjectController();
// Create a new board object
router.post("/:boardId", authMiddleware, (req, res) =>
  objectController.createObject(req, res)
);

// Get board objects
router.get("/:boardId", authMiddleware, (req, res) =>
  objectController.getBoardObjects(req, res)
);

// Update a board object
router.put("/:boardId/:objectId", authMiddleware, (req, res) =>
  objectController.updateObject(req, res)
);

// Delete a board object
router.delete("/:boardId/:objectId", authMiddleware, (req, res) =>
  objectController.deleteObject(req, res)
);

export default router;
