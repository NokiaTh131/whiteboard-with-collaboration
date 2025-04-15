/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Types } from 'mongoose';
import { Server, Socket } from 'socket.io';
import { BoardObjectService } from 'src/board-object/board-object.service';
import { BoardService } from 'src/board/board.service';
import { ParticipantsService } from 'src/participants/participants.service';
import { PermissionService } from 'src/permission/permission.service';
import { UserService } from 'src/user/user.service';
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class SocketServiceGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(
    private readonly participantsService: ParticipantsService,
    private readonly permissionService: PermissionService,
    private readonly boardService: BoardService,
    private readonly boardObjectService: BoardObjectService,
    private readonly userService: UserService,
  ) {}
  private cursors = new Map<string, any>();
  private selection = new Map<string, string[]>();
  private server: Server;

  handleConnection() {
    console.log('Client connected');
  }

  handleDisconnect(client: Socket) {
    const boardId = client.data.boardId as string; // Retrieve stored boardId
    const userId = client.data.user?.id as string; // Retrieve userId
    if (boardId && userId) {
      this.participantsService.removeParticipant(boardId, userId);
      const participants = this.participantsService.getParticipants(boardId);

      this.server.to(boardId).emit('room', participants);
      this.cursors.delete(userId);
      this.selection.delete(userId);

      this.server.to(boardId).emit('cursor:leave', userId);
      this.server.to(boardId).emit('selection:cleared', { userId });

      console.log(`User ${userId} disconnected from board ${boardId}`);
    }
  }

  afterInit(server: Server) {
    this.server = server;
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket) {
    console.log('GG ez');
    const cookie = client.handshake.headers.cookie;
    return cookie;
  }

  @SubscribeMessage('board:join')
  async handleBoardJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() boardId: string,
  ) {
    const userId = (client as any).data.user.id as string;
    //initialize boardId
    (client as any).data.boardId = boardId;

    const hasAccess = await this.permissionService.canAccessBoard(
      userId,
      boardId,
    );

    if (!hasAccess) {
      client.emit('error', { message: 'Access denied' });
      return { message: 'Access denied' };
    }
    client.join(boardId);
    const board = await this.boardService.findById(boardId);
    const boardObjects = await this.boardObjectService.findById(boardId);
    const user = await this.userService.findById(userId);

    client.emit('board:state', {
      board,
      objects: boardObjects,
    });

    this.participantsService.addParticipant(boardId, {
      userId,
      userName: user?.username || 'Unknown user',
    });

    const participants = this.participantsService.getParticipants(boardId);
    this.server.to(boardId).emit('room', participants);

    // Emit cursors and selections
    for (const [cursorUserId, cursorData] of this.cursors.entries()) {
      if (cursorData.boardId === boardId && cursorUserId !== userId) {
        client.emit('cursor:update', cursorData);
      }
    }

    for (const [selectionUserId, objectIds] of this.selection.entries()) {
      if (selectionUserId !== userId) {
        client.emit('selection:updated', {
          userId: selectionUserId,
          objectIds,
        });
      }
    }
  }

  @SubscribeMessage('cursor:move')
  handleCursorMove(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: any,
  ) {
    const userId = socket.data.user.id as string;
    const { boardId, position, username } = data;

    const cursorUpdate = {
      userId,
      username,
      position,
      boardId,
    };

    this.cursors.set(userId, cursorUpdate);
    socket.to(boardId as string).emit('cursor:update', cursorUpdate);
  }

  @SubscribeMessage('cursor:leave')
  handleCursorLeave(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: any,
  ) {
    const userId = socket.data.user.id as string;
    const { boardId } = data;

    this.cursors.delete(userId);
    socket.to(boardId as string).emit('cursor:leave', userId);
  }

  @SubscribeMessage('selection:update')
  handleSelectionUpdate(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: any,
  ) {
    const userId = socket.data.user.id as string;
    const { boardId, objectIds } = data;

    this.selection.set(userId, objectIds);

    this.server.to(boardId as string).emit('selection:updated', {
      userId,
      objectIds,
    });
  }

  @SubscribeMessage('selection:clear')
  handleSelectionClear(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: any,
  ) {
    const userId = socket.data.user.id as string;
    const { boardId } = data;

    this.selection.delete(userId);
    this.server.to(boardId as string).emit('selection:cleared', { userId });
  }

  @SubscribeMessage('object:create')
  async handleObjectCreate(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: any,
  ) {
    const { boardId, object } = data;
    const userId = socket.data.user.id as string;

    const canEdit = await this.permissionService.canEditBoard(
      userId,
      boardId as string,
    );

    if (!canEdit) {
      socket.emit('error', { message: 'Edit permission denied' });
      return;
    }
    const newObject = await this.boardObjectService.create({
      ...object,
      boardId: new Types.ObjectId(boardId),
      createdBy: new Types.ObjectId(userId),
    });

    this.server.to(boardId).emit('object:created', newObject);
  }

  @SubscribeMessage('object:update')
  async handleObjectUpdate(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: any,
  ) {
    const { boardId, objectId, updates } = data;
    const userId = socket.data.user.id as string;

    const canEdit = await this.permissionService.canEditBoard(
      userId,
      boardId as string,
    );

    if (!canEdit) {
      socket.emit('error', { message: 'Edit permission denied' });
      return;
    }

    const updatedObject = await this.boardObjectService.findByIdAndUpdate(
      objectId,
      updates,
    );

    this.server.to(boardId).emit('object:updated', updatedObject);
  }

  @SubscribeMessage('object:delete')
  async handleObjectDelete(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: any,
  ) {
    const { boardId, objectId } = data;
    const userId = socket.data.user.id as string;

    const canEdit = await this.permissionService.canEditBoard(
      userId,
      boardId as string,
    );

    if (!canEdit) {
      socket.emit('error', { message: 'Edit permission denied' });
      return;
    }

    await this.boardObjectService.findByIdAndDelete(objectId);
    this.server.to(boardId).emit('object:deleted', objectId);
  }
}
