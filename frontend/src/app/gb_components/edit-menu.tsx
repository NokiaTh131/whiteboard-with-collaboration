"use client";
import React from "react";
import { Trash2, UserPlus } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface EditMenuProps {
  boardId: string;
  onDelete: () => void;
}

export default function EditMenu({ boardId, onDelete }: EditMenuProps) {
  const router = useRouter();
  const handleDelete = async () => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/boards/${boardId}`,
        {
          withCredentials: true,
        }
      );
      onDelete();
    } catch (error) {
      if (error instanceof Error) return { error: error.message };
    }
  };

  return (
    <div className="absolute text-gray-800 w-auto bg-white rounded-lg border border-gray-200 shadow-lg  z-90">
      <div className="hover:bg-gray-100 text-gray-600">
        <button
          onClick={() => router.push(`/addmember?boardId=${boardId}`)}
          className="ml-2 p-2 rounded-full flex items-center space-x-2 cursor-pointer"
        >
          <UserPlus className="h-5 w-5" />
          <span>Add members</span>
        </button>
      </div>

      <div className="hover:bg-gray-100 text-gray-600">
        <button
          onClick={handleDelete}
          className="ml-2 p-2 rounded-full flex items-center space-x-2 cursor-pointer"
        >
          <Trash2 className="h-5 w-5" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}
