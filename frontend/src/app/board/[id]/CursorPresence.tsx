import React, { memo } from "react";
import { Point } from "./type";
import { MousePointer2 } from "lucide-react";
import { motion } from "framer-motion";
import { connectionIdToColor } from "@/app/lib/utils";

interface CursorPresenceProps {
  position: Point;
  userId: string;
  username: string;
}

export const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = connectionIdToColor(Math.abs(hash));
  return color;
};

export const CursorPresence = memo(
  ({ position, userId, username }: CursorPresenceProps) => {
    const userColor = stringToColor(userId);

    return (
      <motion.div
        className="absolute pointer-events-none"
        animate={{
          left: position.x,
          top: position.y,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 50,
        }}
        style={{ zIndex: 9999 }}
      >
        <MousePointer2
          size={20}
          color={userColor || "#000"}
          strokeWidth={2}
          fill={userColor || "#000"}
        />

        <div
          className="absolute left-5 top-0 px-2 py-1 text-xs font-medium text-white rounded-md"
          style={{
            backgroundColor: userColor || "#000",
            whiteSpace: "nowrap",
            transform: "translateY(-50%)",
          }}
        >
          {username}
        </div>
      </motion.div>
    );
  }
);

CursorPresence.displayName = "CursorPresence";
