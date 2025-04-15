"use client";

import { memo, useCallback } from "react";
import { BoardObject, Camera, Color } from "./type";
import { boundingBox } from "@/app/hooks/use-selection-bounds";
import { ColorPicker } from "./Color_picker";
import { Socket } from "socket.io-client";
import { Trash2 } from "lucide-react";

interface SelectionToolsProps {
  camera: Camera;
  setLastColor: (color: Color) => void;
  boardObjects: BoardObject[];
  selectedObjects: string[];
  socket?: Socket;
  boardId: string;
}

export const SelectionTools = memo(
  ({
    camera,
    setLastColor,
    boardObjects,
    selectedObjects,
    socket,
    boardId,
  }: SelectionToolsProps) => {
    const soleObjectId =
      selectedObjects.length === 1 ? selectedObjects[0] : null;

    const selectionBounds = boundingBox(
      boardObjects.find((object) => object._id === soleObjectId)
        ? [boardObjects.find((object) => object._id === soleObjectId)!]
        : []
    );

    const onDeleteObjects = useCallback(() => {
      if (selectedObjects.length > 0) {
        Object.values(selectedObjects).forEach((objectId) => {
          socket?.emit("object:delete", {
            boardId: boardId,
            objectId: objectId,
          });
        });
      }
    }, [boardId, selectedObjects, socket]);

    const setFill = useCallback(
      (fill: Color) => {
        setLastColor(fill);

        Object.values(selectedObjects).forEach((objectId) => {
          socket?.emit("object:update", {
            boardId: boardId,
            objectId: objectId,
            updates: {
              fill: fill,
            },
          });
        });
      },
      [boardId, setLastColor, socket, selectedObjects]
    );

    if (!selectionBounds) return null;

    const x = selectionBounds.width / 2 + selectionBounds.x + camera.x;
    const y = selectionBounds.y + camera.y;

    return (
      <div
        className="absolute p-3 rounded-xl bg-white shadow-sm border border-neutral-200 flex select-none"
        style={{
          transform: `translate(calc(${x}px - 50%), calc(${y - 16}px - 100%))`,
        }}
      >
        <ColorPicker onChange={setFill} />
        <button className="cursor-pointer" onClick={onDeleteObjects}>
          <Trash2 />
        </button>
      </div>
    );
  }
);

SelectionTools.displayName = "SelectionTools";
