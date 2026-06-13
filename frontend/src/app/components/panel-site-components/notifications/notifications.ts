import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface NotificationItem {
  id: number;
  title: string;
  time: string;
  body: string;
}

@Component({
  selector: 'notifications',
  imports: [],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class Notifications {
  constructor(private http: HttpClient){};
  notifications: NotificationItem[] = [
    {
      id: 1,
      title: 'Nowy rezerwacja',
      time: '2 min temu',
      body: 'Klient Jan Kowalski zarezerwował serwis oil-change na dzień 15.01.2025 o godzinie 14:00.',
    },
    {
      id: 2,
      title: 'Nowa opinia',
      time: '15 min temu',
      body: 'Klient Marek Nowak wystawił ocenę 5 gwiazdek dla serwisu Serwis Samochodowy Plus.',
    }
  ];

  deleteNotification(id: number): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    if (this.notifications.length === 0) {
      this.notifications.push({
        id: 0,
        title: 'Brak nowych powiadomień',
        time: '',
        body: 'Gdy otrzymasz nowe powiadomienia, pojawią się one tutaj.',
      });
    }
  }
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`
    };
  }
  
  fetchNotifications(){
    this.http.get<any[]>("url",{
      headers: this.getAuthHeaders()
    }).subscribe({
      //todo: implement notifications fetch
    });
  }  
}
