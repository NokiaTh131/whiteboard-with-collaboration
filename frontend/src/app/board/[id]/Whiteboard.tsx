/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import InformationBar from "./InformationBar";
import Toolbar from "./ToolBar";
import {
  CanvasState,
  CanvasMode,
  Camera,
  Color,
  LayerType,
  Point,
  BoardObject,
  Participants,
  User,
  CursorPosition,
  Side,
  XYWH,
} from "./type";
import { pointerEventToCanvasPoint, rersizeBounds } from "@/app/lib/utils";
import { LayerPreview } from "./Layer_Preview";
import { CursorPresence, stringToColor } from "./CursorPresence";
import { SelectionBox } from "./SelectionBox";
import { SelectionTools } from "./SelectionTools";

interface CanvasProbs {
  boardId: string;
}

interface Board {
  _id: string;
  title: string;
  isPublic: boolean;
  backgroundColor: string;
}

interface SelectionMap {
  [userId: string]: string[];
}

export const Canvas = ({ boardId }: CanvasProbs) => {
  const [canvasState, setCanvasState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });
  const [lastUsedColor, setLastUsedColor] = useState<Color>({
    r: 0,
    g: 0,
    b: 0,
  });
  const [boardObjects, setBoardObjects] = useState<BoardObject[]>([]);
  const [board, setBoard] = useState<Board | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [participants, setParticipants] = useState<Participants[]>([]);
  const [cursors, setCursors] = useState<Record<string, CursorPosition>>({});
  const [user, setUser] = useState<User>({
    id: "unknown",
    email: "unknown",
    username: "unknown",
  });
  const [error, setError] = useState<string>("");
  const [selectedObjects, setSelectedObjects] = useState<string[]>([]);
  const [otherSelections, setOtherSelections] = useState<SelectionMap>({});
  const [lastCursorUpdate, setLastCursorUpdate] = useState(0);
  const CURSOR_UPDATE_THROTTLE = 30; // ms
  const [resize, setResize] = useState<XYWH | null>(null);
  const [reposition, setRePosition] =
    useState<Record<string, { x: number; y: number }>>();

  const MAX_OBJECTS = 50;

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_SOCKET_URL, {
      withCredentials: true,
    });
    const local_user = localStorage.getItem("user");
    if (local_user) {
      setUser(JSON.parse(local_user));
    }

    socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    socket.emit("board:join", boardId);

    socket.on("board:state", (data) => {
      setBoardObjects(data.objects);
      setBoard(data.board);
    });

    socket.on("error", (data) => {
      setError(data.message);
    });

    socket.on("object:created", (newObject) => {
      console.log(newObject);
      setBoardObjects((prev) => [...prev, newObject]);
    });

    socket.on("object:updated", (updatedObject: BoardObject) => {
      setBoardObjects((prev) => {
        if (!updatedObject) {
          return prev;
        }
        return prev.map((obj) =>
          obj._id === updatedObject._id ? updatedObject : obj
        );
      });
    });

    socket.on("object:deleted", (objectId: string) => {
      setBoardObjects((prev) => prev.filter((obj) => obj._id !== objectId));
      setSelectedObjects([]);
    });

    // Cursor movement handlers
    socket.on("cursor:update", (cursorData) => {
      setCursors((prevCursors) => ({
        ...prevCursors,
        [cursorData.userId]: cursorData,
      }));
    });

    socket.on("cursor:leave", (userId) => {
      setCursors((prevCursors) => {
        const newCursors = { ...prevCursors };
        delete newCursors[userId];
        return newCursors;
      });
    });

    // Room handler
    socket.on("room", (data) => {
      setParticipants(data);
    });

    //Selection handler
    socket.on("selection:updated", ({ userId, objectIds }) => {
      if (userId !== user.id) {
        setOtherSelections((prev) => ({
          ...prev,
          [userId]: objectIds,
        }));
      }
    });

    socket.on("selection:cleared", ({ userId }) => {
      if (userId !== user.id) {
        setOtherSelections({});
        setSelectedObjects([]);
      }
    });

    setSocket(socket);

    return () => {
      socket.off("error");
      socket.off("board:state");
      socket.off("object:create");
      socket.off("room");
      socket.off("cursor:update");
      socket.off("cursor:leave");
      socket.off("selection:updated");
      socket.off("selection:cleared");
      socket.disconnect();
    };
  }, [boardId, user.id]);

  const insertLayer = useCallback(
    (layerType: LayerType, position: Point) => {
      const objectsSize = boardObjects.length;
      if (objectsSize >= MAX_OBJECTS) return;

      const object = {
        type: layerType,
        x: position.x,
        y: position.y,
        width: 100,
        height: 100,
        fill: lastUsedColor,
      };
      socket?.emit("object:create", { object, boardId });
      setCanvasState({ mode: CanvasMode.None });
    },
    [lastUsedColor, boardId, socket, boardObjects.length]
  );

  const onWheel = useCallback((e: React.WheelEvent) => {
    setCamera((camera) => ({
      x: camera.x - e.deltaX,
      y: camera.y - e.deltaY,
    }));
  }, []);

  // Throttled cursor update function
  const emitCursorPosition = useCallback(
    (point: Point) => {
      const now = Date.now();
      if (
        socket &&
        socket.connected &&
        user.id !== "unknown" &&
        now - lastCursorUpdate > CURSOR_UPDATE_THROTTLE
      ) {
        socket.emit("cursor:move", {
          boardId,
          position: point,
          username: user.username,
        });
        setLastCursorUpdate(now);
      }
    }, // Send updates at most every 50ms
    [socket, boardId, user, lastCursorUpdate]
  );

  const translateSelectedLayers = useCallback(
    (point: Point) => {
      if (canvasState.mode !== CanvasMode.Translating) {
        return;
      }
      const offset = {
        x: point.x - canvasState.current.x,
        y: point.y - canvasState.current.y,
      };

      const newPositions: Record<string, { x: number; y: number }> = {};

      const updatedBoardObjects = boardObjects.map((obj) => {
        if (selectedObjects.includes(obj._id)) {
          // Calculate new position
          const newX = obj.x + offset.x;
          const newY = obj.y + offset.y;

          // Store the new position with object id as key
          newPositions[obj._id] = { x: newX, y: newY };

          return {
            ...obj,
            x: newX,
            y: newY,
          };
        }
        return obj;
      });
      setBoardObjects(updatedBoardObjects);
      setCanvasState({ mode: CanvasMode.Translating, current: point });
      setRePosition(newPositions);
    },
    [canvasState, selectedObjects, boardObjects]
  );

  const resizeSelectedLayer = useCallback(
    (point: Point) => {
      if (canvasState.mode !== CanvasMode.Resizing) {
        return;
      }
      const bounds = rersizeBounds(
        canvasState.initialBounds,
        canvasState.corner,
        point
      );

      // Find and update the object
      const updatedBoardObjects = boardObjects.map((obj) => {
        if (obj._id === selectedObjects[0]) {
          return {
            ...obj,
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
          };
        }
        return obj;
      });

      setBoardObjects(updatedBoardObjects);

      setResize(bounds);
    },
    [boardObjects, canvasState, selectedObjects]
  );

  const onResizeHandlePointerdown = useCallback(
    (corner: Side, initialBounds: XYWH) => {
      setCanvasState({
        mode: CanvasMode.Resizing,
        initialBounds,
        corner,
      });
    },
    []
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      const point = pointerEventToCanvasPoint(e, camera);
      // Send cursor position to server
      emitCursorPosition(point);
      if (canvasState.mode === CanvasMode.Translating) {
        translateSelectedLayers(point);
      } else if (canvasState.mode === CanvasMode.Resizing) {
        resizeSelectedLayer(point);
      }

      // Use point for other canvas actions if needed
    },
    [
      camera,
      translateSelectedLayers,
      emitCursorPosition,
      resizeSelectedLayer,
      canvasState,
    ]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera);
      if (canvasState.mode === CanvasMode.Inserting) {
        insertLayer(canvasState.layerType, point);
      } else if (canvasState.mode === CanvasMode.Translating) {
        if (reposition && Object.keys(reposition).length > 0) {
          Object.entries(reposition).forEach(([objectId, position]) => {
            socket?.emit("object:update", {
              boardId: boardId,
              objectId: objectId,
              updates: {
                x: position.x,
                y: position.y,
              },
            });
          });
        }
        setCanvasState({ mode: CanvasMode.None });
      } else if (canvasState.mode === CanvasMode.Resizing) {
        socket?.emit("object:update", {
          boardId: boardId,
          objectId: selectedObjects[0],
          updates: resize,
        });
        setCanvasState({ mode: CanvasMode.None });
      } else {
        setCanvasState({ mode: CanvasMode.None });
      }
    },
    [
      boardId,
      camera,
      canvasState,
      insertLayer,
      resize,
      selectedObjects,
      socket,
      reposition,
    ]
  );

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(""); // Clear error after 3 seconds
      }, 3000);

      return () => clearTimeout(timer); // Cleanup on unmount
    }
  }, [error]);

  const onPointDown = useCallback(
    (e: React.PointerEvent, objectId: string) => {
      if (
        canvasState.mode === CanvasMode.Pencil ||
        canvasState.mode === CanvasMode.Inserting
      ) {
        return;
      }

      e.stopPropagation();
      const point = pointerEventToCanvasPoint(e, camera);
      let newSelection: string[] = [];

      if (!selectedObjects.includes(objectId)) {
        newSelection = [objectId];
        setSelectedObjects(newSelection);
        socket?.emit("selection:update", {
          boardId,
          objectIds: newSelection,
        });
      } else {
        newSelection = selectedObjects.filter((id) => id !== objectId);
      }
      if (newSelection.length < 1) {
        console.log("clear select");
        socket?.emit("selection:clear", { boardId });
      }

      // Start translation if objects are selected
      setCanvasState({ mode: CanvasMode.Translating, current: point });
    },
    [setCanvasState, camera, canvasState.mode, socket, boardId, selectedObjects]
  );

  const onPointerLeave = useCallback(() => {
    if (socket && socket.connected && user.id !== "unknown") {
      socket.emit("cursor:leave", { boardId });
    }
  }, [socket, boardId, user.id]);

  // Replace your current getObjectSelectionColor useCallback with this useMemo approach
  const objectSelectionColors = useMemo(() => {
    const colorMap = new Map();

    // Then, check selections from other users
    for (const [userId, selections] of Object.entries(otherSelections)) {
      for (const objectId of selections) {
        // Only set color if not already selected by current user
        if (!colorMap.has(objectId)) {
          colorMap.set(objectId, stringToColor(userId));
        }
      }
    }
    // Return a function that checks the map
    return (objectId: any) => colorMap.get(objectId);
  }, [otherSelections]);

  return (
    <main
      className="h-full w-full relative bg-neutral-100 touch-none"
      onPointerLeave={onPointerLeave}
    >
      <div className="fixed left-1/2 top-1/2">
        {JSON.stringify(otherSelections)}
      </div>
      <div className="fixed left-1/2 top-1/4">
        {JSON.stringify(selectedObjects)}
      </div>
      {error && (
        <div className="fixed left-1/2 top-5 bg-red-500 text-white p-2 rounded">
          {error}
        </div>
      )}
      <Toolbar canvasState={canvasState} setCanvasState={setCanvasState} />
      <SelectionTools
        camera={camera}
        setLastColor={setLastUsedColor}
        boardObjects={boardObjects}
        selectedObjects={selectedObjects}
        socket={socket || undefined}
        boardId={boardId}
      />
      {board && (
        <InformationBar
          user={user}
          board_title={board.title}
          participants={participants}
        />
      )}

      {/* Render cursors on top of everything else */}
      {Object.values(cursors).map(
        (cursor) =>
          user.id !== cursor.userId && (
            <CursorPresence
              key={cursor.userId}
              position={{
                x: cursor.position.x + camera.x,
                y: cursor.position.y + camera.y,
              }}
              userId={cursor.userId}
              username={cursor.username}
            />
          )
      )}

      <svg
        onWheel={onWheel}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className={`h-[100vh] w-[100vw]`}
        style={{
          backgroundColor: board?.backgroundColor,
        }}
      >
        <g style={{ transform: `translate(${camera.x}px, ${camera.y}px)` }}>
          {boardObjects.map((layer) => (
            <LayerPreview
              key={layer._id}
              layer={layer}
              onLayerPointDown={onPointDown}
              selectionColor={objectSelectionColors(layer._id)}
            />
          ))}
          <SelectionBox
            onResizeHandlePointerdown={onResizeHandlePointerdown}
            selectedObjects={selectedObjects}
            boardObjects={boardObjects}
          />
        </g>
      </svg>
    </main>
  );
};
