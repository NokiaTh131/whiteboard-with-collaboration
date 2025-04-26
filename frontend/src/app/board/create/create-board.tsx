// app/dashboard/create/page.tsx
"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

const CreateBoardPage = () => {
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#f8f9fa");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const colorOptions = [
    { name: "White", value: "#ffffff" },
    { name: "Light", value: "#f8f9fa" },
    { name: "Gray", value: "#e9ecef" },
    { name: "Blue", value: "#e7f5ff" },
    { name: "Green", value: "#ebfbee" },
    { name: "Yellow", value: "#fff9db" },
    { name: "Orange", value: "#fff4e6" },
    { name: "Pink", value: "#fff0f6" },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/boards`,
        {
          title,
          isPublic,
          backgroundColor,
        },
        {
          withCredentials: true,
        }
      );
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error) return { error: error.message };
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Create New Board
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Board Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your board title..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              disabled={isLoading}
              required
            />
          </div>

          {/* Public/Private Toggle */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Visibility
            </label>
            <div className="flex items-center">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                  !isPublic
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setIsPublic(false)}
                disabled={isLoading}
              >
                Private
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                  isPublic
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setIsPublic(true)}
                disabled={isLoading}
              >
                Public
              </button>
            </div>
            <p className="text-xs text-gray-500">
              {isPublic
                ? "Anyone with the link can view this board"
                : "Only you can access this board"}
            </p>
          </div>

          {/* Background Color Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Background Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setBackgroundColor(color.value)}
                  className={`w-full aspect-square rounded-md border-2 ${
                    backgroundColor === color.value
                      ? "border-blue-600"
                      : "border-gray-200"
                  }`}
                  style={{ backgroundColor: color.value }}
                  disabled={isLoading}
                >
                  {backgroundColor === color.value && (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex items-center justify-center py-2 px-4 rounded-md text-white font-medium transition-colors 
              ${
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                Create Board
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateBoardPage;
