import { Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  public socket: Socket; // 🔥 rendu public pour accès contrôlé

  constructor(private zone: NgZone) {
    this.socket = io('http://localhost:3001');
  }

  // ===== EMIT =====

  joinRoom(room: string, username: string) {
    this.socket.emit('join_room', { room, username });
  }

  sendMessage(data: any) {
    this.socket.emit('send_message', data);
  }

  sendTyping(data: any) {
    this.socket.emit('typing', data);
  }

  sendSeen(data: { room: string; messageId: any }) {
    this.socket.emit('message_seen', data);
  }

  // ===== LISTEN =====

  onMessage(callback: (data: any) => void) {
    this.socket.on('receive_message', (data) => {
      this.zone.run(() => callback(data));
    });
  }

  onUsers(callback: (data: any) => void) {
    this.socket.on('room_users', (data) => {
      this.zone.run(() => callback(data));
    });
  }

  onHistory(callback: (data: any) => void) {
    this.socket.on('message_history', (data) => {
      this.zone.run(() => callback(data));
    });
  }

  onSystemMessage(callback: (data: any) => void) {
    this.socket.on('system_message', (data) => {
      this.zone.run(() => callback(data));
    });
  }

  onTyping(callback: (data: any) => void) {
    this.socket.on('user_typing', (data) => {
      this.zone.run(() => callback(data));
    });
  }

  // 👀 NEW: SEEN LISTENER
  onSeen(callback: (data: any) => void) {
    this.socket.on('message_seen', (data) => {
      this.zone.run(() => callback(data));
    });
  }
 resetSocket() {
  this.socket.removeAllListeners();
}
  // (OPTIONNEL PRO)
  disconnect() {
    this.socket.disconnect();
  }
}