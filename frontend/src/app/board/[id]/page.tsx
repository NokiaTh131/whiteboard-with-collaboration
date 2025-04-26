"use client";
import { Canvas } from "./Whiteboard";
import React, { Suspense, useEffect, useState } from "react";
// import { Canvas } from "./Whiteboard";
import { useParams } from "next/navigation";
import axios from "axios";
import Loading from "@/app/gb_components/loading";
import { useRouter } from "next/navigation";

export interface ResUser {
  _id: string;
  email: string;
  username: string;
}

interface Member {
  _id: string;
  userId: ResUser;
}

function Board() {
  const params = useParams();
  const boardId = params.id as string;
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const get_user = localStorage.getItem("user");
    if (!get_user) return;
    const curr_user = JSON.parse(get_user);

    const checkMembers = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/boards/${boardId}`,
          {
            withCredentials: true,
          }
        );
        const members = response.data.board.members;

        const userExist = members.some(
          (user: Member) =>
            (user.userId._id as string) === (curr_user.id as string)
        );
        if (!userExist) {
          router.push("/dashboard");
          return;
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        router.push("/dashboard");
      }
    };
    checkMembers();
  }, [boardId, router]);

  return !loading ? <div>{<Canvas boardId={boardId} />}</div> : <Loading />;
}

export default function BoardPage() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Board />
      </Suspense>
    </div>
  );
}
