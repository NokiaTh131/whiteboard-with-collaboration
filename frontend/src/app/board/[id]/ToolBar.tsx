"use client";

import React from "react";
import {
  Pencil,
  MousePointer2,
  Square,
  Circle,
  StickyNote,
  Undo,
  Redo,
  Type,
} from "lucide-react";
import { CanvasMode, CanvasState, LayerType } from "./type";

interface ToolbarProbs {
  canvasState: CanvasState;
  setCanvasState: (newState: CanvasState) => void;
  connected?: boolean;
}

const Toolbar = ({ canvasState, setCanvasState }: ToolbarProbs) => {
  return (
    <div className="fixed top-1/2 left-2 transform -translate-y-1/2">
      <div className="flex flex-col space-y-4 rounded-md bg-white p-1 shadow-md">
        {/* Move Tool */}
        <button
          className={`p-2 transition rounded-sm cursor-pointer ${
            canvasState.mode === CanvasMode.None ||
            canvasState.mode === CanvasMode.Translating ||
            canvasState.mode === CanvasMode.SelectionNet ||
            canvasState.mode === CanvasMode.Resizing ||
            canvasState.mode === CanvasMode.Pressing
              ? "bg-blue-200"
              : "hover:bg-gray-200"
          }`}
          onClick={() => setCanvasState({ mode: CanvasMode.None })}
        >
          <MousePointer2 size={26} />
        </button>
        {/* Sticky-Note Tool */}
        <button
          className={`p-2 transition rounded-sm cursor-pointer ${
            canvasState.mode === CanvasMode.Inserting &&
            canvasState.layerType === LayerType.Note
              ? "bg-blue-200"
              : "hover:bg-gray-200"
          }`}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Note,
            })
          }
        >
          <StickyNote size={26} />
        </button>
        {/* Text Tool */}
        <button
          className={`p-2 transition rounded-sm cursor-pointer ${
            canvasState.mode === CanvasMode.Inserting &&
            canvasState.layerType === LayerType.Text
              ? "bg-blue-200"
              : "hover:bg-gray-200"
          }`}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Text,
            })
          }
        >
          <Type size={26} />
        </button>
        {/* Pencil Tool */}
        <button
          className={`p-2 transition rounded-sm cursor-pointer ${
            canvasState.mode === CanvasMode.Pencil
              ? "bg-blue-200"
              : "hover:bg-gray-200"
          }`}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Pencil,
            })
          }
        >
          <Pencil size={26} />
        </button>
        {/* Rectangle Tool */}
        <button
          className={`p-2 transition rounded-sm cursor-pointer ${
            canvasState.mode === CanvasMode.Inserting &&
            canvasState.layerType === LayerType.Rectangle
              ? "bg-blue-200"
              : "hover:bg-gray-200"
          }`}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Rectangle,
            })
          }
        >
          <Square size={26} />
        </button>
        {/* Ellipse Tool */}
        <button
          className={`p-2 transition rounded-sm cursor-pointer ${
            canvasState.mode === CanvasMode.Inserting &&
            canvasState.layerType === LayerType.Ellipse
              ? "bg-blue-200"
              : "hover:bg-gray-200"
          }`}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Ellipse,
            })
          }
        >
          <Circle size={26} />
        </button>
      </div>
      <div className="flex flex-col space-y-4 rounded-md bg-white p-1 my-2 shadow-md">
        {/* Undo */}
        <button className="p-2 hover:bg-gray-200 rounded-sm">
          <Undo size={26} />
        </button>
        {/* Redo */}
        <button className="p-2 hover:bg-gray-200 rounded-sm">
          <Redo size={26} />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
