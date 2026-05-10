import { Component } from '@angular/core';
import { Notifications } from '../notifications/notifications';

@Component({
  selector: 'site-header',
  imports: [Notifications],
  templateUrl: './site-header.html',
  styleUrl: './site-header.css',
})
export class SiteHeader {
  isNotificationsOpen = false;

  openNotifications() {
    this.isNotificationsOpen = !this.isNotificationsOpen;
  }
  logout() {
    // todo: logout user
    console.log('Wylogowywanie użytkownika...');
  }

}
