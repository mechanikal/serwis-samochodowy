import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface NotificationItem {
  id: string;
  title: string;
  time: string;
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
  notifications: NotificationItem[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchNotifications();
  }

  fetchNotifications(): void {
    this.http.get<any[]>('http://localhost:3000/api/notifications', {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (data) => {
        this.notifications = data.map(n => ({
          id: n._id ?? n.id,
          title: n.title ?? 'Zmiana statusu wizyty',
          time: this.formatNotificationDate(n.date),
          body: n.body ?? `Status wizyty zostal zmieniony na: ${n.newVisitStatus ?? ''}`,
          status: n.status ?? 'unread'
        }));
        if (this.notifications.length === 0) {
          this.setEmptyNotificationsPlaceholder();
        }
      },
      error: (err) => {
        console.error('Blad pobierania powiadomien', err);
        this.setEmptyNotificationsPlaceholder();
      }
    });
  }

  markNotificationAsRead(id: string): void {
    this.http.patch(`http://localhost:3000/api/notifications/read/${id}`, {}, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: () => {
        this.notifications = this.notifications.map((n) =>
          n.id === id ? { ...n, status: 'read' } : n
        );
      },
      error: (err) => console.error('Blad oznaczania powiadomienia jako przeczytane', err)
    });
  }

  deleteNotification(id: string): void {
    this.http.delete(`http://localhost:3000/api/notifications/${id}`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: () => {
        this.removeNotificationFromList(id);
      },
      error: (err) => console.error('Blad usuwania powiadomienia', err)
    });
  }

  private removeNotificationFromList(id: string): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    if (this.notifications.length === 0) {
      this.setEmptyNotificationsPlaceholder();
    }
  }

  private setEmptyNotificationsPlaceholder(): void {
    this.notifications = [
      {
        id: '0',
        title: 'Brak nowych powiadomien',
        time: '',
        body: 'Gdy otrzymasz nowe powiadomienia, pojawia sie one tutaj.',
        status: 'read'
      }
    ];
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  private formatNotificationDate(date: string | Date | null): string {
    if (date == null) {
      return '';
    }
    return new Date(date).toLocaleString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

