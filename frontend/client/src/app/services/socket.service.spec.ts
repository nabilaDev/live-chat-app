import { TestBed } from '@angular/core/testing';
import { NgZone } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SocketService } from './socket.service';

// MOCK
const mockSocket = {
  emit: vi.fn(),
  on: vi.fn(),
  removeAllListeners: vi.fn(),
  disconnect: vi.fn(),
};

vi.mock('socket.io-client', () => ({
  io: () => mockSocket
}));

describe('SocketService', () => {
  let service: SocketService;

  beforeEach(() => {
    mockSocket.emit.mockClear();
    mockSocket.on.mockClear();

    TestBed.configureTestingModule({
      providers: [
  SocketService,
  {
    provide: NgZone,
    useValue: {
      run: (fn: any) => fn()
    }
  }
]
    });

    service = TestBed.inject(SocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('joinRoom() should emit join_room', () => {
    service.joinRoom('general', 'nabila');

    expect(mockSocket.emit).toHaveBeenCalledWith('join_room', {
      room: 'general',
      username: 'nabila'
    });
  });

  it('sendMessage() should emit send_message', () => {
    const msg = { id: 1, message: 'Hello', author: 'nabila', room: 'general' };

    service.sendMessage(msg);

    expect(mockSocket.emit).toHaveBeenCalledWith('send_message', msg);
  });

  it('onMessage() should register listener', () => {
    const cb = vi.fn();

    service.onMessage(cb);

    expect(mockSocket.on).toHaveBeenCalledWith(
      'receive_message',
      expect.any(Function)
    );
  });
});