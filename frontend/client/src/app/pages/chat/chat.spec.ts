import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatComponent } from './chat';
import { SocketService } from '../../services/socket.service';
import { AuthService } from '../../services/auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockSocketService = {
  joinRoom: vi.fn(),
  sendMessage: vi.fn(),
  sendTyping: vi.fn(),
  sendSeen: vi.fn(),
  resetSocket: vi.fn(),
  onMessage: vi.fn(),
  onHistory: vi.fn(),
  onSeen: vi.fn(),
  onUsers: vi.fn(),
  onSystemMessage: vi.fn(),
  onTyping: vi.fn(),
};

const mockAuthService = {
  getToken: vi.fn().mockReturnValue(null),
  login: vi.fn(),
  register: vi.fn(),
  saveToken: vi.fn(),
  logout: vi.fn(),
};

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;

  beforeEach(async () => {
    mockAuthService.getToken.mockReturnValue(null);
    mockSocketService.sendMessage.mockClear();
    mockSocketService.joinRoom.mockClear();
    mockSocketService.resetSocket.mockClear();

    await TestBed.configureTestingModule({
      imports: [ChatComponent],
      providers: [
        { provide: SocketService, useValue: mockSocketService },
        { provide: AuthService, useValue: mockAuthService },
        ChangeDetectorRef,
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start as not logged in', () => {
    expect(component.isLogged).toBe(false);
  });

  it('should have empty messages on init', () => {
    expect(component.messages.length).toBe(0);
  });

  it('should default room to "general"', () => {
    expect(component.room).toBe('general');
  });

  it('login() should do nothing if username is empty', () => {
    component.username = '';
    component.password = 'Pass123!';
    component.login();
    expect(mockAuthService.login).not.toHaveBeenCalled();
  });

  it('register() should do nothing if fields are empty', () => {
    component.username = '';
    component.password = '';
    component.register();
    expect(mockAuthService.register).not.toHaveBeenCalled();
  });

  it('logout() should reset state and call resetSocket', () => {
    component.isLogged = true;
    component.username = 'nabila';
    component.messages = [{ id: 1, message: 'test' } as any];
    component.users = [{ name: 'nabila' } as any];

    component.logout();

    expect(component.isLogged).toBe(false);
    expect(component.username).toBe('');
    expect(component.messages.length).toBe(0);
    expect(component.users.length).toBe(0);
    expect(mockSocketService.resetSocket).toHaveBeenCalled();
  });

  it('sendMessage() should not send empty message', () => {
    component.message = '   ';
    component.sendMessage();
    expect(mockSocketService.sendMessage).not.toHaveBeenCalled();
  });

  it('sendMessage() should emit message and clear input', () => {
    component.username = 'nabila';
    component.message = 'Hello!';
    component.sendMessage();

    expect(mockSocketService.sendMessage).toHaveBeenCalled();
    expect(component.message).toBe('');
  });

  it('isMe() should return true for own messages', () => {
    component.username = 'nabila';
    expect(component.isMe({ author: 'nabila' } as any)).toBe(true);
  });

  it('parseJwt() should return null for invalid token', () => {
    const result = component.parseJwt('invalid');
    expect(result).toBeNull();
  });
});