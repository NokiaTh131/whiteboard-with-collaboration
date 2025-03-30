"use client";
import { Canvas } from "./Whiteboard";
import React from "react";
// import { Canvas } from "./Whiteboard";
import { useParams } from "next/navigation";

export default function Board() {
  const params = useParams();
  const boardId = params.id as string;
  return <div>{<Canvas boardId={boardId} />}</div>;
}
