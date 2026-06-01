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
  userData = { firstName: 'User', lastName: 'Unknown' };
  constructor(private router: Router) {}
  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('User data from localStorage:', user);
    if (user) {
      this.userData.firstName = user.firstName || 'User';
      this.userData.lastName = user.lastName || 'Unknown';
    }
  }

  openNotifications() {
    this.isNotificationsOpen = !this.isNotificationsOpen;
  }

  logout(): void {
    this.router.navigate(['login-site']);
  }
}
