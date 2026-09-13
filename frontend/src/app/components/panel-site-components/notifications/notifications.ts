import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

export interface NotificationItem {
  id: string;
  title: string;
  time: string;
  rawDate: Date;
  body: string;
  status: string;
}

@Component({
  selector: 'notifications',
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class Notifications implements OnInit {
  unreadNotifications: NotificationItem[] = [];
  readNotifications: NotificationItem[] = [];
  showRead = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchNotifications();
  }

  fetchNotifications(): void {
    this.http.get<any[]>('http://localhost:3000/api/notifications', {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (data) => {
        const parsed: NotificationItem[] = (data || []).map(n => {
          const rawDate = n.time ? new Date(n.time) : (n.date ? new Date(n.date) : new Date(0));
          return {
            id: n._id ?? n.id,
            title: n.title ?? 'Zmiana statusu wizyty',
            time: this.formatNotificationDate(rawDate),
            rawDate,
            body: n.body ?? `Status wizyty został zmieniony na: ${n.newVisitStatus ?? ''}`,
            status: n.status ?? 'unread'
          };
        });

        parsed.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

        this.unreadNotifications = parsed.filter(n => n.status !== 'read');
        this.readNotifications = parsed.filter(n => n.status === 'read');
      },
      error: (err) => {
        console.error('Błąd pobierania powiadomień', err);
        this.unreadNotifications = [];
        this.readNotifications = [];
      }
    });
  }

  toggleShowRead(): void {
    this.showRead = !this.showRead;
  }

  markNotificationAsRead(id: string): void {
    this.http.patch(`http://localhost:3000/api/notifications/read/${id}`, {}, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: () => {
        const targetIndex = this.unreadNotifications.findIndex(n => n.id === id);
        if (targetIndex !== -1) {
          const item = this.unreadNotifications[targetIndex];
          this.unreadNotifications = this.unreadNotifications.filter(n => n.id !== id);
          const updatedItem: NotificationItem = { ...item, status: 'read' };
          this.readNotifications = [updatedItem, ...this.readNotifications]
            .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
        }
      },
      error: (err) => console.error('Błąd oznaczania powiadomienia jako przeczytane', err)
    });
  }

  deleteNotification(id: string): void {
    this.http.delete(`http://localhost:3000/api/notifications/${id}`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: () => {
        this.unreadNotifications = this.unreadNotifications.filter(n => n.id !== id);
        this.readNotifications = this.readNotifications.filter(n => n.id !== id);
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

  private formatNotificationDate(date: Date | null): string {
    if (date == null || isNaN(date.getTime())) {
      return '';
    }
    return date.toLocaleString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

