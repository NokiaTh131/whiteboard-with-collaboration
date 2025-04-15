"use client";

import { memo } from "react";
import { LayerType, BoardObject } from "./type";
import { Rectangle } from "./components/rectangle";
interface LayerPreviewProps {
  layer: BoardObject;
  onLayerPointDown: (e: React.PointerEvent, layerId: string) => void;
  selectionColor?: string;
}

export const LayerPreview = memo(
  ({ layer, onLayerPointDown, selectionColor }: LayerPreviewProps) => {
    //fetch layer data by id from server as layer
    if (!layer) {
      return null;
    }
    switch (layer.type) {
      case LayerType.Rectangle:
        return (
          <Rectangle
            id={layer._id}
            layer={layer}
            onPointerDown={onLayerPointDown}
            selectionColor={selectionColor}
          />
        );
      default:
        console.warn("Unknown layer type");
        return null;
    }
  }
);

LayerPreview.displayName = "LayerPreview";
