import {
  Component,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocketService } from '../../services/socket.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html'
})
export class ChatComponent implements OnInit {

  username = '';
  password = '';
  isLogged = false;

  message = '';
  messages: any[] = [];
  room = 'general';

  users: any[] = [];
  typingUser = '';

  @ViewChild('chatContainer') chatContainer!: ElementRef;

  constructor(
    private socketService: SocketService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  // ===== INIT =====
  ngOnInit() {
    const token = this.authService.getToken();

    if (token) {
      const payload = this.parseJwt(token);

      if (payload) {
        this.username = payload.username;
        this.isLogged = true;
        this.initChat();
      }
    }
  }

  // ===== PARSE TOKEN =====
  parseJwt(token: string) {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  // ===== LOGIN =====
  login() {
    if (!this.username || !this.password) return;

    this.authService.login({
      username: this.username,
      password: this.password
    }).subscribe((res: any) => {

      this.authService.saveToken(res.token);
      this.username = res.username;
      this.isLogged = true;
      this.socketService.resetSocket();

      this.initChat();

    }, err => {
      alert(err.error.message);
    });
  }

  // ===== REGISTER =====
  register() {
    if (!this.username || !this.password) return;

    this.authService.register({
      username: this.username,
      password: this.password
    }).subscribe(() => {
      alert('User created, you can login now');
    }, err => {
      alert(err.error.message);
    });
  }
logout() {

  this.authService.logout();

  this.isLogged = false;
  this.username = '';
  this.password = '';
  this.messages = [];
  this.users = [];

  // 🔥 reset socket
  this.socketService.resetSocket();

}
  // ===== INIT CHAT =====
  initChat() {

    this.messages = [];
  this.users = [];

  

    this.socketService.joinRoom(this.room, this.username);

    // ===== HISTORY =====
    this.socketService.onHistory((history) => {
      this.messages = history.map((msg: any) => ({
        ...msg,
        status: msg.status || 'sent'
      }));

      this.scrollToBottom();
      this.cdr.detectChanges();
    });

    // ===== MESSAGE =====
    this.socketService.onMessage((data) => {

      const index = this.messages.findIndex(
        (msg) => msg.id === data.id
      );

      if (index !== -1) {
        this.messages[index] = {
          ...data,
          status: data.status || 'sent'
        };
      } else {
        this.messages = [
          ...this.messages,
          { ...data, status: data.status || 'sent' }
        ];
      }

      // envoyer seen si ce n'est pas moi
      if (data.author !== this.username) {
        this.socketService.sendSeen({
          room: this.room,
          messageId: data.id
        });
      }

      this.scrollToBottom();
      this.cdr.detectChanges();
    });

    // ===== SEEN =====
    this.socketService.onSeen(({ messageId }) => {

      const msg = this.messages.find(m => m.id === messageId);

      if (msg && msg.author === this.username) {
        msg.status = 'seen';
      }

      this.messages = [...this.messages];
      this.cdr.detectChanges();
    });

    // ===== USERS =====
   this.socketService.onUsers((users) => {
  this.users = [...users]; // 
  this.cdr.detectChanges();
});

    // ===== SYSTEM =====
    this.socketService.onSystemMessage((msg) => {
      this.messages = [
        ...this.messages,
        { system: true, message: msg.message }
      ];

      this.scrollToBottom();
      this.cdr.detectChanges();
    });

    // ===== TYPING =====
    this.socketService.onTyping((user) => {
      this.typingUser = user;

      setTimeout(() => {
        this.typingUser = '';
        this.cdr.detectChanges();
      }, 2000);
    });
  }

  // ===== SEND MESSAGE =====
  sendMessage() {
    if (!this.message.trim()) return;

    const tempMessage = {
      id: Date.now() + Math.random(),
      room: this.room,
      message: this.message,
      author: this.username,
      timestamp: new Date(),
      status: 'pending'
    };

    this.messages = [...this.messages, tempMessage];
    this.scrollToBottom();

    this.socketService.sendMessage(tempMessage);

    this.message = '';
    this.cdr.detectChanges();
  }

  // ===== TYPING =====
  onTyping() {
    this.socketService.sendTyping({
      room: this.room,
      username: this.username
    });
  }

  // ===== HELPER =====
  isMe(msg: any) {
    return msg.author === this.username;
  }

  // ===== SCROLL =====
  scrollToBottom() {
    setTimeout(() => {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop =
          this.chatContainer.nativeElement.scrollHeight;
      }
    }, 50);
  }
}