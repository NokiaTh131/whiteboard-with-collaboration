"use client";

import { memo } from "react";
import { LayerType, BoardObject } from "./type";
import { Rectangle } from "./components/rectangle";
import { Ellipse } from "./components/ellipse";
import { Text } from "./components/text";
import { Note } from "./components/note";
import { Path } from "./components/path";
import { colorToCSS } from "@/app/lib/utils";
interface LayerPreviewProps {
  layer: BoardObject;
  onLayerPointDown: (e: React.PointerEvent, layerId: string) => void;
  selectionColor?: string;
  updateValue: (newValue: string) => void;
}

export const LayerPreview = memo(
  ({
    layer,
    onLayerPointDown,
    selectionColor,
    updateValue,
  }: LayerPreviewProps) => {
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
      case LayerType.Ellipse:
        return (
          <Ellipse
            id={layer._id}
            layer={layer}
            onPointerDown={onLayerPointDown}
            selectionColor={selectionColor}
          />
        );
      case LayerType.Text:
        return (
          <Text
            id={layer._id}
            layer={layer}
            onPointerDown={onLayerPointDown}
            selectionColor={selectionColor}
            updateValue={updateValue}
          />
        );
      case LayerType.Note:
        return (
          <Note
            id={layer._id}
            layer={layer}
            onPointerDown={onLayerPointDown}
            selectionColor={selectionColor}
            updateValue={updateValue}
          />
        );
      case LayerType.Path:
        return (
          <Path
            key={layer._id}
            points={layer.points ?? []}
            onPointerDown={(e) => onLayerPointDown(e, layer._id)}
            x={layer.x}
            y={layer.y}
            fill={layer.fill ? colorToCSS(layer.fill) : "#000"}
            stroke={selectionColor}
          />
        );
      default:
        console.warn("Unknown layer type");
        return null;
    }
  }
);

LayerPreview.displayName = "LayerPreview";
