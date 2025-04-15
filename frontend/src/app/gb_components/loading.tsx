import React from "react";

export default function Loading() {
  return (
    <div className="fixed left-1/2 top-1/2 flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
    </div>
  );
}
