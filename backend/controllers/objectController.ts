import { Request, Response } from "express";
import { BoardObject } from "../models/BoardObject";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { PermissionService } from "../services/permissionService";

export class ObjectController {
  private permissionService: PermissionService;

  constructor() {
    this.permissionService = new PermissionService();
  }

  // Create a new board object
  async createObject(req: AuthenticatedRequest, res: Response) {
    try {
      const { boardId } = req.params;
      const objectData = req.body;
      const userId = req.user.id;

      // Check edit permissions
      const canEdit = await this.permissionService.canEditBoard(
        userId,
        boardId
      );

      if (!canEdit) {
        res.status(403).json({ message: "Edit permission denied" });
        return;
      }

      // Create new board object
      const newObject = new BoardObject({
        ...objectData,
        boardId: boardId,
        createdBy: userId,
      });

      await newObject.save();

      res.status(201).json(newObject);
    } catch (error) {
      res.status(500).json({ message: "Object creation failed", error });
    }
  }

  // Get board objects
  async getBoardObjects(req: AuthenticatedRequest, res: Response) {
    try {
      const { boardId } = req.params;
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

      const objects = await BoardObject.find({ boardId: boardId }).populate(
        "createdBy",
        "username"
      );

      res.json(objects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch objects", error });
    }
  }

  // Update board object
  async updateObject(req: AuthenticatedRequest, res: Response) {
    try {
      const { boardId, objectId } = req.params;
      const updates = req.body;
      const userId = req.user.id;

      // Check edit permissions
      const canEdit = await this.permissionService.canEditBoard(
        userId,
        boardId
      );

      if (!canEdit) {
        res.status(403).json({ message: "Edit permission denied" });
        return;
      }

      // Find existing object
      const existingObject = await BoardObject.findById(objectId);

      if (!existingObject) {
        res.status(404).json({ message: "Object not found" });
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

      res.json(updatedObject);
    } catch (error) {
      res.status(500).json({ message: "Object update failed", error });
    }
  }

  // Delete board object
  async deleteObject(req: AuthenticatedRequest, res: Response) {
    try {
      const { boardId, objectId } = req.params;
      const userId = req.user.id;

      // Check edit permissions
      const canEdit = await this.permissionService.canEditBoard(
        userId,
        boardId
      );

      if (!canEdit) {
        res.status(403).json({ message: "Edit permission denied" });
        return;
      }

      // Find existing object
      const existingObject = await BoardObject.findById(objectId);

      if (!existingObject) {
        res.status(404).json({ message: "Object not found" });
        return;
      }

      // Delete object
      await BoardObject.findByIdAndDelete(objectId);

      res.json({ message: "Object deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Object deletion failed", error });
    }
  }
}
