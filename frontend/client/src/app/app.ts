import { Component } from '@angular/core';

import { ChatComponent } from './pages/chat/chat';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChatComponent],
  templateUrl: './app.html'
})
export class AppComponent {}