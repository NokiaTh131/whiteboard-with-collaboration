"use client";

import { colorToCSS } from "@/app/lib/utils";
import { Color } from "./type";

interface ColorPickerProps {
  onChange: (color: Color) => void;
}

interface ColorButtonProps {
  onClick: (color: Color) => void;
  color: Color;
}

export const ColorPicker = ({ onChange }: ColorPickerProps) => {
  return (
    <div
      className="flex flex-wrap gap-2 items-center max-w-[200px]
    pr-2 mr-2 border-r border-neutral-200"
    >
      <ColorButton
        onClick={onChange}
        color={{
          r: 255,
          g: 92,
          b: 92,
        }}
      />

      <ColorButton
        onClick={onChange}
        color={{
          r: 255,
          g: 184,
          b: 0,
        }}
      />

      <ColorButton
        onClick={onChange}
        color={{
          r: 0,
          g: 199,
          b: 183,
        }}
      />

      <ColorButton
        onClick={onChange}
        color={{
          r: 91,
          g: 112,
          b: 255,
        }}
      />

      <ColorButton
        onClick={onChange}
        color={{
          r: 112,
          g: 203,
          b: 255,
        }}
      />

      <ColorButton
        onClick={onChange}
        color={{
          r: 123,
          g: 97,
          b: 255,
        }}
      />

      <ColorButton
        onClick={onChange}
        color={{
          r: 44,
          g: 181,
          b: 62,
        }}
      />

      <ColorButton
        onClick={onChange}
        color={{
          r: 255,
          g: 133,
          b: 222,
        }}
      />
    </div>
  );
};

const ColorButton = ({ onClick, color }: ColorButtonProps) => {
  return (
    <button
      className="w-8 h-8 items-center flex justify-center hover:opacity-75 transition cursor-pointer"
      onClick={() => onClick(color)}
    >
      <div
        className="h-8 w-8 border border-neutral-300 rounded-md"
        style={{
          backgroundColor: colorToCSS(color),
        }}
      ></div>
    </button>
  );
};
