import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Notifications } from '../notifications/notifications';

@Component({
  selector: 'site-header',
  imports: [Notifications],
  templateUrl: './site-header.html',
  styleUrl: './site-header.css',
})
export class SiteHeader implements OnInit {
  @Input() userMode?: 'mechanic' | 'client';
  isNotificationsOpen = false;
  userData = { firstName: 'User', lastName: 'Unknown', role: '' };
  constructor(private router: Router) {}
  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('User data from localStorage:', user);
    if (user) {
      this.userData.firstName = user.firstName || 'User';
      this.userData.lastName = user.lastName || 'Unknown';
      this.userData.role = user.role || '';
    }
  }

  get isMechanic(): boolean {
    if (this.userMode) {
      return this.userMode === 'mechanic';
    }
    return this.userData.role === 'mechanic' || (!this.userData.role && this.userMode !== 'client');
  }

  openNotifications() {
    this.isNotificationsOpen = !this.isNotificationsOpen;
  }

  logout(): void {
    this.router.navigate(['login-site']);
  }
}
