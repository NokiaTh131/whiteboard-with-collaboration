"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { UserPlus, Users, Mail, X, Loader2, CheckCircle } from "lucide-react";
import { ResUser } from "../board/[id]/page";
import axios from "axios";

const Page = () => {
  const router = useRouter();
  const params = useSearchParams();
  const boardId = params.get("boardId");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<ResUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [receivedUser, setReceiverUser] = useState<ResUser[]>([]);
  const [isDropMenu, setIsDropMenu] = useState(false);
  const [permission, setPermission] = useState("editor");

  useEffect(() => {
    if (!boardId) {
      router.back();
    }

    const fetchUserData = async () => {
      try {
        const users = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/user/search`,
          {
            email: searchQuery as string,
          },
          {
            withCredentials: true,
          }
        );
        setReceiverUser(users.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUserData();
  }, [searchQuery, boardId]);

  // Dummy data for user suggestions
  const suggestedUsers = receivedUser.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectUser = (user: ResUser) => {
    if (!selectedUsers.some((selectedUser) => selectedUser._id === user._id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchQuery("");
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((user) => user._id !== userId));
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      selectedUsers.map(async (user) => {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/boards/${boardId}/invite`,
          {
            boardId: boardId,
            email: user.email,
            role: permission,
          },
          { withCredentials: true }
        );
      });
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setSelectedUsers([]);
      }, 1000);
    } catch (error) {
      if (error instanceof Error) console.error(error.message);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div
      onClick={() => {
        if (isDropMenu) setIsDropMenu(false);
      }}
      className="min-h-screen bg-gray-100 p-4"
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            &larr; Back to board
          </button>
          <h1 className="text-xl font-bold flex items-center">
            <Users className="mr-2" size={20} />
            Invite Members
          </h1>
        </div>

        {/* Main content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleInvite} className="space-y-6">
            {/* Selected users */}
            {selectedUsers.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Users
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <div
                      key={user._id}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center text-sm"
                    >
                      {user.username}
                      <button
                        type="button"
                        onClick={() => handleRemoveUser(user._id)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search users */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Search Users
              </label>
              <div className="relative w-full">
                {/* Left icon */}
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserPlus className="h-5 w-5 text-black" />
                </div>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by email..."
                  className="pl-10 pr-24 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {/* Search results */}
              {searchQuery && (
                <div className="mt-2 border border-gray-200 rounded-md overflow-hidden bg-white max-h-60 overflow-y-auto">
                  {suggestedUsers.length > 0 ? (
                    suggestedUsers.map((user) => (
                      <button
                        key={user._id}
                        type="button"
                        onClick={() => handleSelectUser(user)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
                      >
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="px-4 py-3 text-sm text-gray-500">
                      No users found
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Permission Level
              </label>
              <div className="flex">
                <button
                  onClick={() => setPermission("editor")}
                  type="button"
                  className={`px-4 py-2 ${
                    permission === "editor"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  } rounded-l-md`}
                >
                  Can Edit
                </button>
                <button
                  onClick={() => setPermission("viewer")}
                  type="button"
                  className={`px-4 py-2 ${
                    permission === "viewer"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  } rounded-r-md`}
                >
                  Can View
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || selectedUsers.length === 0}
              className={`w-full flex items-center justify-center py-2 px-4 rounded-md text-white font-medium transition-colors 
                ${
                  isLoading || selectedUsers.length === 0
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Sending Invites...
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Invites Sent!
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5 mr-2" />
                  Send Invites ({selectedUsers.length})
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Page;
