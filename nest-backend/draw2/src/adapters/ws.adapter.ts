/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Injectable } from '@nestjs/common';
import { ServerOptions, Socket } from 'socket.io';
import * as cookie from 'cookie';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthenticatedSocketIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);

    server.use((socket: Socket, next) => {
      const { cookie: cookieHeader } = socket.handshake.headers;

      if (!cookieHeader) {
        return next(new Error('No cookies found'));
      }

      const cookies = cookie.parse(cookieHeader);
      const token = cookies['token']; // use the cookie key storing your JWT

      if (!token) {
        return next(new Error('Token not found in cookies'));
      }

      try {
        if (!process.env.JWT_SECRET) {
          return next(new Error('JWT secret is not defined'));
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        (socket as any).data.user = decoded; // attach user info to socket
        next();
      } catch (err) {
        if (err instanceof Error) return next(new Error('Invalid token'));
      }
    });

    return server;
  }
}
