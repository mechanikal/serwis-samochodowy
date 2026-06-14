import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface NotificationItem {
  id: string;
  title: string;
  time: string;
  body: string;
}

@Component({
  selector: 'notifications',
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class Notifications implements OnInit {
  constructor(private http: HttpClient){};
  notifications: NotificationItem[] = [];

  ngOnInit(): void {
    this.fetchNotifications();
  }

  deleteNotification(id: string): void {
    this.http.delete(`http://localhost:3000/api/notifications/${id}`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: () => {
        this.notifications = this.notifications.filter((n) => n.id !== id);
        if (this.notifications.length === 0) {
          this.notifications.push({
            id: '0',
            title: 'Brak nowych powiadomień',
            time: '',
            body: 'Gdy otrzymasz nowe powiadomienia, pojawią się one tutaj.',
          });
        }
      },
      error: (err) => console.error('Błąd usuwania powiadomienia', err)
    });
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`
    };
  }
  
  fetchNotifications(){
    this.http.get<any[]>("http://localhost:3000/api/notifications",{
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (data) => {
        if (data.length === 0) {
          this.notifications = [{
            id: '0',
            title: 'Brak nowych powiadomień',
            time: '',
            body: 'Gdy otrzymasz nowe powiadomienia, pojawią się one tutaj.',
          }];
          return;
        }
        this.notifications = data.map(n => ({
          id: n._id,
          title: n.title,
          time: this.formatTime(n.time),
          body: n.body
        }));
      },
      error: (err) => console.error('Błąd pobierania powiadomień', err)
    });
  }

  private formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    
    if (diffMin < 1) return 'teraz';
    if (diffMin < 60) return `${diffMin} min temu`;
    
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} godz. temu`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} dni temu`;
  }
}

