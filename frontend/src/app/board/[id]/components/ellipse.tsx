import { BoardObject } from "../type";
import { colorToCSS } from "@/app/lib/utils";

interface EllipseProps {
  id: string;
  layer: BoardObject;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

export const Ellipse = ({
  id,
  layer,
  onPointerDown,
  selectionColor,
}: EllipseProps) => {
  const { x, y, width, height, fill } = layer;

  return (
    <ellipse
      className="drop-shadow-md"
      onPointerDown={(e) => onPointerDown(e, id)}
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
      x={0}
      y={0}
      cx={width / 2}
      cy={height / 2}
      rx={width / 2}
      ry={height / 2}
      strokeWidth={2}
      fill={fill ? colorToCSS(fill) : "#000"}
      stroke={selectionColor || "transparent"}
    />
  );
};
