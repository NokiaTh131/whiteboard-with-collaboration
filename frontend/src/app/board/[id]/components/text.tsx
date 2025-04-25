import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import { Sriracha } from "next/font/google";
import { cn, colorToCSS } from "@/app/lib/utils";
import { BoardObject } from "../type";
import { debounce } from "lodash";

const font = Sriracha({ weight: "400", subsets: ["latin"] });

interface TextProps {
  id: string;
  layer: BoardObject;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
  updateValue: (newValue: string) => void;
}

const calculateFontSize = (width: number, height: number) => {
  const scaleFactor = 0.5;
  const fontSizeBaseHeight = height * scaleFactor;
  const fontSizeBaseWidth = width * scaleFactor;

  return Math.min(fontSizeBaseHeight, fontSizeBaseWidth);
};

export const Text = ({
  id,
  layer,
  onPointerDown,
  selectionColor,
  updateValue,
}: TextProps) => {
  const { x, y, width, height, fill, value } = layer;

  const debounceUpdateText = debounce(updateValue, 1000);

  const handleTextChange = (e: ContentEditableEvent) => {
    debounceUpdateText(e.target.value);
  };

  return (
    <foreignObject
      x={x}
      y={y}
      width={width}
      height={height}
      onPointerDown={(e) => onPointerDown(e, id)}
      style={{
        outline: selectionColor ? `1px solid ${selectionColor}` : "none",
      }}
    >
      <ContentEditable
        html={value || "Text"}
        onChange={handleTextChange}
        className={cn(
          "h-full w-full flex items-center justify-center text-center drop-shadow-md outline-none",
          font.className
        )}
        style={{
          fontSize: calculateFontSize(width, height),
          color: fill ? colorToCSS(fill) : "#000",
        }}
      />
    </foreignObject>
  );
};
