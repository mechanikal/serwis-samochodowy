import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Notifications } from '../notifications/notifications';

@Component({
  selector: 'site-header',
  imports: [Notifications],
  templateUrl: './site-header.html',
  styleUrl: './site-header.css',
})
export class SiteHeader {
  isNotificationsOpen = false;

  constructor(private router: Router) {}

  openNotifications() {
    this.isNotificationsOpen = !this.isNotificationsOpen;
  }

  logout(): void {
    this.router.navigate(['login-site']);
  }
}
