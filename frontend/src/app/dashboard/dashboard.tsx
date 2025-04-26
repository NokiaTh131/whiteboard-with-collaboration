"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PlusCircle,
  Search,
  Settings,
  Grid,
  Layout,
  User,
  Bell,
  HelpCircle,
  LogOut,
  MoreVertical,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { User as UserType } from "../board/[id]/type";
import Loading from "../gb_components/loading";
import EditMenu from "../gb_components/edit-menu";
// Define types for our data
interface Board {
  _id: string;
  title: string;
  owner: string;
  updatedAt: string;
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<Board[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isDropMenu, setIsDropMenu] = useState<boolean>(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [isEditmenu, setEditMenu] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    const haveUser = localStorage.getItem("user");

    if (!haveUser) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(haveUser));

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/boards`,
          {
            withCredentials: true,
          }
        );
        setData(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error(err);
        localStorage.removeItem("user");
        router.push("login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleDelete = (id: string) => {
    setData((prev) => (prev ? prev.filter((board) => board._id !== id) : null));
  };

  const handleClick = (boardId: string) => {
    console.log("Board ID:", boardId);
    router.push(`/board/${boardId}`, { scroll: false });
  };

  const filteredProjects = (boards: Board[] = []) => {
    return boards.filter((board) =>
      board.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleLogout = async () => {
    //use fetch cause bug in axios withCredential request
    localStorage.removeItem("user");
    try {
      setLoading(true);
      const result = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
        {
          method: "Post",
          credentials: "include",
        }
      );
      console.log(result);
      setError(null);
      router.push("/login");
    } catch (err) {
      setError("Failed to logout dashboard data");
      console.error(err);
    }
  };

  const toThaiDate = (utc: string) => {
    const date = new Date(utc);
    const thaiDate = date.toLocaleString("th-TH", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return thaiDate;
  };

  return (
    <div
      onClick={() => {
        if (isDropMenu) setIsDropMenu(false);

        if (isEditmenu) setEditMenu("");
      }}
      className="min-h-screen bg-gray-50"
    >
      {/* Top navigation bar */}
      <nav className="bg-white border-b border-gray-200 px-4 py-2.5 fixed w-full z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-black">Whiteboard</div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search boards..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
              <Bell className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
              <HelpCircle className="h-5 w-5" />
            </button>

            <button
              onClick={() => {
                setIsDropMenu(true);
              }}
              className="h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center  cursor-pointer"
            >
              <User className="h-5 w-5" />
            </button>
          </div>
        </div>
        {isDropMenu && (
          <div className="absolute text-gray-800 right-1 w-48 bg-white rounded-lg border border-gray-200 shadow-lg">
            <div className="hover:bg-gray-100 text-gray-600">
              <button className="ml-2 p-2 rounded-full flex items-center space-x-2 cursor-pointer">
                <Settings className="h-5 w-5" />
                <span>Setting</span>
              </button>
            </div>

            <div className="hover:bg-gray-100 text-gray-600">
              <button
                onClick={handleLogout}
                className="ml-2 p-2 rounded-full flex items-center space-x-2 cursor-pointer"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="pt-20 px-6 pb-16">
        {/* Header with view options */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {user?.username}&apos;s boards
          </h1>
          <div className="flex items-center space-x-2">
            <button
              className={`p-2 rounded-md ${
                view === "grid" ? "bg-gray-200" : "bg-white"
              }`}
              onClick={() => setView("grid")}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              className={`p-2 rounded-md ${
                view === "list" ? "bg-gray-200" : "bg-white"
              }`}
              onClick={() => setView("list")}
            >
              <Layout className="h-5 w-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <>
            {/* Recent projects section */}
            <section className="mb-12">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Recent boards
              </h2>

              {data && filteredProjects(data).length === 0 ? (
                <div
                  onClick={() => router.push("/board/create")}
                  className={`${
                    view === "grid" ? "block" : "flex items-center"
                  } bg-white border border-gray-200 border-dashed rounded-lg overflow-hidden hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200 cursor-pointer`}
                >
                  {view === "grid" ? (
                    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                      <PlusCircle className="h-8 w-8 text-blue-500 mb-2" />
                      <p className="font-medium text-blue-600">
                        Create new board
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 flex-shrink-0 bg-blue-50 flex items-center justify-center">
                        <PlusCircle className="h-6 w-6 text-blue-500" />
                      </div>
                      <div className="ml-4 flex-1 p-3">
                        <h3 className="font-medium text-blue-600">
                          Create new board
                        </h3>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div
                  className={`grid ${
                    view === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                      : "grid-cols-1 gap-3"
                  }`}
                >
                  {data &&
                    filteredProjects(data).map((board) => (
                      <div
                        key={board._id}
                        className={`group ${
                          view === "grid" ? "block" : "flex items-center"
                        } bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200`}
                      >
                        {view === "grid" ? (
                          <>
                            <div
                              className="h-36 bg-gray-100 relative cursor-pointer "
                              onClick={() => {
                                handleClick(board._id);
                              }}
                            >
                              <img
                                src={`https://picsum.photos/seed/${board.title}/600/500`}
                                alt={board.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 flex items-center justify-center opacity-0 group-hover:opacity-50"></div>
                            </div>
                            <div className="flex justify-between">
                              <div className="p-3">
                                <h3 className="font-medium text-gray-800 truncate">
                                  {board.title}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                  Last edited {toThaiDate(board.updatedAt)}
                                </p>
                              </div>
                              <MoreVertical
                                onClick={() => {
                                  setEditMenu(board._id);
                                }}
                                className="z-999 cursor-pointer my-5"
                              />
                            </div>
                            {isEditmenu == board._id && (
                              <EditMenu
                                boardId={board._id}
                                onDelete={() => handleDelete(board._id)}
                              />
                            )}
                          </>
                        ) : (
                          <>
                            <div
                              className="w-12 h-12 flex-shrink-0 bg-gray-100 flex items-center justify-center mx-2 cursor-pointer"
                              onClick={() => handleClick(board._id)}
                            >
                              <img
                                src={`https://picsum.photos/seed/${board.title}/400/320`}
                                alt={board.title}
                                className="w-full h-full object-cover rounded-sm"
                              />
                            </div>
                            <div className="ml-4 flex-1 p-3">
                              <h3 className="font-medium text-gray-800">
                                {board.title}
                              </h3>
                              <p className="text-xs text-gray-500">
                                Last edited {toThaiDate(board.updatedAt)}
                              </p>
                            </div>
                            <div className="pr-4"></div>
                          </>
                        )}
                      </div>
                    ))}

                  {/* Create new board tile */}
                  <div
                    onClick={() => router.push("/board/create")}
                    className={`${
                      view === "grid" ? "block" : "flex items-center"
                    } bg-white border border-gray-200 border-dashed rounded-lg overflow-hidden hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200 cursor-pointer`}
                  >
                    {view === "grid" ? (
                      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                        <PlusCircle className="h-8 w-8 text-blue-500 mb-2" />
                        <p className="font-medium text-blue-600">
                          Create new board
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 flex-shrink-0 bg-blue-50 flex items-center justify-center">
                          <PlusCircle className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="ml-4 flex-1 p-3">
                          <h3 className="font-medium text-blue-600">
                            Create new board
                          </h3>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
