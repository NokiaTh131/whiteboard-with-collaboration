"use client";

import { memo } from "react";
import { XYWH, Side, BoardObject, LayerType } from "./type";
import { boundingBox } from "@/app/hooks/use-selection-bounds";

interface SelectionBoxProps {
  onResizeHandlePointerdown: (corner: Side, initialBounds: XYWH) => void;
  selectedObjects: string[];
  boardObjects: BoardObject[];
}

const HANDLE_WIDTH = 8;

export const SelectionBox = memo(
  ({
    selectedObjects,
    boardObjects,
    onResizeHandlePointerdown,
  }: SelectionBoxProps) => {
    const soleObjectId =
      selectedObjects.length === 1 ? selectedObjects[0] : null;

    const soleObject = boardObjects.some((object) => {
      if (object._id === soleObjectId) {
        return object?.type !== LayerType.Path;
      }
      return false;
    });

    const isShowingHandles = soleObjectId && soleObject;

    const bounds = boundingBox(
      boardObjects.find((object) => object._id === soleObjectId)
        ? [boardObjects.find((object) => object._id === soleObjectId)!]
        : []
    );

    if (!bounds) return null;

    return (
      <>
        <rect
          className="fill-transparent stroke-blue-500 stroke-1 pointer-events-none"
          style={{
            transform: `translate(${bounds.x}px, ${bounds.y}px)`,
          }}
          x={0}
          y={0}
          width={bounds.width}
          height={bounds.height}
        />
        {isShowingHandles && (
          <>
            <rect
              className="fill-white stroke-1 stroke-blue-500"
              x={0}
              y={0}
              style={{
                cursor: "nwse-resize",
                width: `${HANDLE_WIDTH}px`,
                height: `${HANDLE_WIDTH}px`,
                transform: `translate(${bounds.x - HANDLE_WIDTH / 2}px, ${
                  bounds.y - HANDLE_WIDTH / 2
                }px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerdown(Side.Top + Side.Left, bounds);
              }}
            />
            <rect
              className="fill-white stroke-1 stroke-blue-500"
              x={0}
              y={0}
              style={{
                cursor: "ns-resize",
                width: `${HANDLE_WIDTH}px`,
                height: `${HANDLE_WIDTH}px`,
                transform: `translate(${
                  bounds.x + bounds.width / 2 - HANDLE_WIDTH / 2
                }px, ${bounds.y - HANDLE_WIDTH / 2}px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerdown(Side.Top, bounds);
              }}
            />
            <rect
              className="fill-white stroke-1 stroke-blue-500"
              x={0}
              y={0}
              style={{
                cursor: "nesw-resize",
                width: `${HANDLE_WIDTH}px`,
                height: `${HANDLE_WIDTH}px`,
                transform: `translate(${
                  bounds.x + bounds.width - HANDLE_WIDTH / 2
                }px, ${bounds.y - HANDLE_WIDTH / 2}px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerdown(Side.Top + Side.Right, bounds);
              }}
            />
            <rect
              className="fill-white stroke-1 stroke-blue-500"
              x={0}
              y={0}
              style={{
                cursor: "ew-resize",
                width: `${HANDLE_WIDTH}px`,
                height: `${HANDLE_WIDTH}px`,
                transform: `translate(${
                  bounds.x - HANDLE_WIDTH / 2 + bounds.width
                }px, ${bounds.y + bounds.height / 2 - HANDLE_WIDTH / 2}px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerdown(Side.Right, bounds);
              }}
            />
            <rect
              className="fill-white stroke-1 stroke-blue-500"
              x={0}
              y={0}
              style={{
                cursor: "nwse-resize",
                width: `${HANDLE_WIDTH}px`,
                height: `${HANDLE_WIDTH}px`,
                transform: `translate(${
                  bounds.x + bounds.width - HANDLE_WIDTH / 2
                }px, ${bounds.y + bounds.height - HANDLE_WIDTH / 2}px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerdown(Side.Bottom + Side.Right, bounds);
              }}
            />
            <rect
              className="fill-white stroke-1 stroke-blue-500"
              x={0}
              y={0}
              style={{
                cursor: "ns-resize",
                width: `${HANDLE_WIDTH}px`,
                height: `${HANDLE_WIDTH}px`,
                transform: `translate(${
                  bounds.x + bounds.width / 2 - HANDLE_WIDTH / 2
                }px, ${bounds.y + bounds.height - HANDLE_WIDTH / 2}px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerdown(Side.Bottom, bounds);
              }}
            />
            <rect
              className="fill-white stroke-1 stroke-blue-500"
              x={0}
              y={0}
              style={{
                cursor: "nesw-resize",
                width: `${HANDLE_WIDTH}px`,
                height: `${HANDLE_WIDTH}px`,
                transform: `translate(${bounds.x - HANDLE_WIDTH / 2}px, ${
                  bounds.y + bounds.height - HANDLE_WIDTH / 2
                }px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerdown(Side.Bottom + Side.Left, bounds);
              }}
            />
            <rect
              className="fill-white stroke-1 stroke-blue-500"
              x={0}
              y={0}
              style={{
                cursor: "ew-resize",
                width: `${HANDLE_WIDTH}px`,
                height: `${HANDLE_WIDTH}px`,
                transform: `translate(${bounds.x - HANDLE_WIDTH / 2}px, ${
                  bounds.y + bounds.height / 2 - HANDLE_WIDTH / 2
                }px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerdown(Side.Left, bounds);
              }}
            />
          </>
        )}
      </>
    );
  }
);

SelectionBox.displayName = "SelectionBox";
