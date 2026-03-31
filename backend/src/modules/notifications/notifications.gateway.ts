import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

/**
 * WebSocket gateway for real-time push notifications.
 * Clients connect with their user ID and join a personal room.
 * Notifications are pushed to specific users or broadcast to all.
 */
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server: Server;

  // Track connected users: userId -> Set<socketId>
  private userSockets = new Map<string, Set<string>>();

  handleConnection(client: Socket): void {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      // Join user to their personal room for targeted notifications
      client.join(`user:${userId}`);

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      this.logger.log(`Client connected: ${client.id} (user: ${userId})`);
    }
  }

  handleDisconnect(client: Socket): void {
    const userId = client.handshake.query.userId as string;
    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId)!.delete(client.id);
      if (this.userSockets.get(userId)!.size === 0) {
        this.userSockets.delete(userId);
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ): void {
    client.join(room);
    this.logger.debug(`Client ${client.id} joined room: ${room}`);
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ): void {
    client.leave(room);
  }

  /**
   * Send a notification to a specific user.
   */
  sendToUser(userId: string, notification: any): void {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  /**
   * Broadcast a notification to all connected clients.
   */
  broadcast(notification: any): void {
    this.server.emit('notification', notification);
  }

  /**
   * Send to a specific room (e.g., organization, project team).
   */
  sendToRoom(room: string, notification: any): void {
    this.server.to(room).emit('notification', notification);
  }

  /**
   * Check if a user is currently online.
   */
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }

  /**
   * Get count of online users.
   */
  getOnlineUserCount(): number {
    return this.userSockets.size;
  }
}
