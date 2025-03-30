import { useCallback, useEffect, useState } from "react";
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
} from "./type";
import { pointerEventToCanvasPoint } from "@/app/lib/utils";
import { LayerPreview } from "./Layer_Preview";
import { CursorPresence } from "./CursorPresence";

interface CanvasProbs {
  boardId: string;
}

interface Board {
  _id: string;
  title: string;
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

  const [lastCursorUpdate, setLastCursorUpdate] = useState(0);
  const CURSOR_UPDATE_THROTTLE = 30; // ms

  useEffect(() => {
    const token = localStorage.getItem("token") as string;
    const socket = io(process.env.NEXT_PUBLIC_API_SOCKET_URL, {
      auth: {
        token: token,
      },
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

    socket.on("object:created", (newObject) => {
      setBoardObjects((prev) => [...prev, newObject]);
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

    setSocket(socket);

    return () => {
      socket.off("board:state");
      socket.off("object:create");
      socket.off("room");
      socket.off("cursor:update");
      socket.off("cursor:leave");
      socket.disconnect();
    };
  }, [boardId]);

  const insertLayer = useCallback(
    (layerType: LayerType, position: Point) => {
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
    [lastUsedColor, boardId, socket]
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

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      const point = pointerEventToCanvasPoint(e, camera);

      // Send cursor position to server
      emitCursorPosition(point);

      // Use point for other canvas actions if needed
    },
    [camera, emitCursorPosition]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera);
      if (canvasState.mode === CanvasMode.Inserting) {
        insertLayer(canvasState.layerType, point);
      } else {
        setCanvasState({ mode: CanvasMode.None });
      }
    },
    [camera, canvasState, insertLayer]
  );

  const onPointDown = useCallback((e: React.PointerEvent, layerId: string) => {
    // Implement your layer pointer down logic here
    console.log("Layer clicked:", layerId);
    // Add your selection or other layer interaction logic
  }, []);

  const onPointerLeave = useCallback(() => {
    if (socket && socket.connected && user.id !== "unknown") {
      socket.emit("cursor:leave", { boardId });
    }
  }, [socket, boardId, user.id]);

  return (
    <main
      className="h-full w-full relative bg-neutral-100 touch-none"
      onPointerLeave={onPointerLeave}
    >
      <Toolbar canvasState={canvasState} setCanvasState={setCanvasState} />
      {board && (
        <InformationBar
          user={user}
          board_title={board?.title}
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
              username={cursor.username}
            />
          )
      )}

      <svg
        onWheel={onWheel}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="h-[100vh] w-[100vw] bg-neutral-200"
      >
        <g style={{ transform: `translate(${camera.x}px, ${camera.y}px)` }}>
          {boardObjects.map((layer) => (
            <LayerPreview
              key={layer._id}
              layer={layer}
              onLayerPointDown={onPointDown}
              selectionColor={"#000"}
            />
          ))}
        </g>
      </svg>
    </main>
  );
};
