import React from "react";
import { MoreVertical } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Participants, User } from "./type";

interface InformationBarProbs {
  user: User;
  board_title: string;
  participants: Participants[];
}

export default function InformationBar({
  board_title,
  participants,
  user,
}: InformationBarProbs) {
  const router = useRouter();

  return (
    <div className="top-3 left-2 bg-white rounded-md fixed p-1 shadow-md flex items-center space-x-4">
      <Image
        src="/logo.svg"
        alt="Logo"
        width={55}
        height={55}
        priority
        className="p-1 mx-2 hover:bg-gray-200 rounded-sm cursor-pointer"
        onClick={() => router.push("/dashboard")}
      />
      <h1 className="text-sm p-2 mx-2 text-gray-800 hover:bg-gray-200 rounded-sm cursor-pointer">
        {board_title}
      </h1>

      <div className="mx-4 p-2 hover:bg-gray-200 rounded-sm cursor-pointer">
        <MoreVertical size={24} />
      </div>

      {participants &&
        participants.map((participant) => (
          <div key={participant.userId} className="flex items-center space-x-2">
            <div
              className={`w-10 h-10 flex items-center justify-center ${
                user.username === participant.userName
                  ? "rounded-full border-2 border-green-500 p-1"
                  : ""
              }`}
            >
              <Image
                key={participant.userId}
                src={`https://avatar.iran.liara.run/public/boy?username=${participant.userName}`}
                alt={participant.userName}
                width={32}
                height={32}
                className="rounded-full select-none"
              />
            </div>
          </div>
        ))}
    </div>
  );
}
