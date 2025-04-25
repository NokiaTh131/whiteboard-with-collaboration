import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import { Sriracha } from "next/font/google";
import { cn, colorToCSS, getContrastingTextColor } from "@/app/lib/utils";
import { BoardObject } from "../type";
import { debounce } from "lodash";

const font = Sriracha({ weight: "400", subsets: ["latin"] });

interface NoteProps {
  id: string;
  layer: BoardObject;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
  updateValue: (newValue: string) => void;
}

const calculateFontSize = (width: number, height: number) => {
  const scaleFactor = 0.1;
  const fontSizeBaseHeight = height * scaleFactor;
  const fontSizeBaseWidth = width * scaleFactor;
  const maxFontSize = 48;
  return Math.min(maxFontSize, fontSizeBaseHeight, fontSizeBaseWidth);
};

export const Note = ({
  id,
  layer,
  onPointerDown,
  selectionColor,
  updateValue,
}: NoteProps) => {
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
        backgroundColor: fill ? colorToCSS(fill) : "#000",
      }}
      className="shadow-md drop-shadow-xl"
    >
      <ContentEditable
        html={value || "Text"}
        onChange={handleTextChange}
        onKeyDown={(e: KeyboardEvent) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
        className={cn(
          "h-full w-full flex items-center justify-center text-center text-clip",
          font.className
        )}
        style={{
          fontSize: calculateFontSize(width, height),
          color: fill ? getContrastingTextColor(fill) : "#000",
          outline: "none",
        }}
      />
    </foreignObject>
  );
};
