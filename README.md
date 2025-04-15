# Collaborative Writeboard App Backend

real-time collaborative drawing application built with NestJS. This backend provides a robust API for user authentication, board management, and real-time drawing features using WebSockets.

## Features

-  **Authentication System**: Register, login, and JWT-based authentication with HTTP-only cookies
-  **User Management**: User creation, search, and profile management
-  **Collaborative Boards**: Create and manage drawing boards with various permission levels
-  **Real-time object management**: WebSocket-based real-time collaboration features
-  **Live Collaboration**: See other users' cursors, selections, and changes in real-time
-  **Permission System**: Role-based access control for boards (owner, editor, viewer)

## Technology Stack

- **Framework**: NestJS
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js with JWT strategy
- **Real-time Communication**: Socket.IO
- **Validation**: Class Validator

## Prerequisites

- Node.js (v14+)
- MongoDB
- npm or yarn

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT
MONGODB_URI
JWT_SECRET
```

## Installation

```bash
# Install dependencies
npm install

# Development
npm run start:dev

```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get authentication token
- `POST /api/auth/logout` - Logout and clear authentication token

### Boards

- `POST /api/boards` - Create a new board
- `GET /api/boards` - Get all boards for the current user
- `GET /api/boards/:id` - Get a specific board with details
- `PUT /api/boards/:id` - Update a board's details
- `DELETE /api/boards/:id` - Delete a board
- `POST /api/boards/:id/invite` - Invite a user to a board
- `DELETE /api/boards/:id/remove` - Remove a user from a board

### Users

- `POST /api/user/search` - Search for users by email

## WebSocket Events

### Client to Server

- `board:join` - Join a board room
- `cursor:move` - Update cursor position
- `cursor:leave` - Notify when cursor leaves
- `selection:update` - Update object selection
- `selection:clear` - Clear object selection
- `object:create` - Create a new drawing object
- `object:update` - Update a drawing object
- `object:delete` - Delete a drawing object

### Server to Client

- `board:state` - Initial board state
- `room` - Room participants update
- `cursor:update` - Cursor position update
- `cursor:leave` - Cursor left notification
- `selection:updated` - Selection updated
- `selection:cleared` - Selection cleared
- `object:created` - Object created
- `object:updated` - Object updated
- `object:deleted` - Object deleted
- `error` - Error messages

## Authentication Flow

1. User registers or logs in
2. Server creates a JWT token and sets it as an HTTP-only cookie
3. Subsequent requests, including WebSocket connections, include this cookie
4. Server validates the JWT for API requests and WebSocket connections
