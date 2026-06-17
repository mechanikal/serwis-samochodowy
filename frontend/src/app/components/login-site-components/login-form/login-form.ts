import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

const API_URL = 'http://localhost:3000/api';

@Component({
  selector: 'login-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login-form.html',
  styleUrl: './login-form.css',
})
export class LoginForm {
  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}
  //login
  loginValue: string = '';
  passwordValue: string = '';
  loginError: boolean = false;
  //register
  repeatPasswordValue: string = '';
  nameValue: string = '';
  surnameValue: string = '';
  phoneValue: string = '';
  emailValue: string = '';
  registerError: string = '';
  registerSuccess: boolean = false;

  mode: string = 'login';

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  loginSubmit() {
    this.http.post(`${API_URL}/login`, {
      identifier: this.loginValue,
      password: this.passwordValue,
    }).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));

        switch (res.user?.role) {
          case 'user':
            console.log('Zalogowano jako użytkownik:', res);
            this.goToUser();
            break;
          case 'mechanic':
            console.log('Zalogowano jako mechanik:', res);
            this.goToMechanic();
            break;
          case 'admin':
            console.log('Zalogowano jako administrator:', res);
            this.goToAdmin();
            break;
        }
      },
      error: (err) => {
        this.loginError = true;
        console.error('Błąd logowania:', err);
      }
    });
  }

  registerSubmit() {
    this.registerError = '';
    this.registerSuccess = false;

    // Validate required fields
    if (!this.loginValue || !this.emailValue || !this.passwordValue ||
        !this.nameValue || !this.surnameValue || !this.phoneValue) {
      this.registerError = 'Wszystkie pola są wymagane';
      return;
    }

    // Validate password confirmation
    if (this.passwordValue !== this.repeatPasswordValue) {
      this.registerError = 'Hasła nie są identyczne';
      return;
    }

    // Validate password strength
    if (this.passwordValue.length < 6) {
      this.registerError = 'Hasło musi mieć co najmniej 6 znaków';
      return;
    }

    const user = {
      username: this.loginValue,
      email: this.emailValue,
      password: this.passwordValue,
      first_name: this.nameValue,
      last_name: this.surnameValue,
      phone: this.phoneValue,
    };

    this.http.post(`${API_URL}/register`, user).subscribe({
      next: (res) => {
        console.log('Rejestracja OK:', res);
        this.registerSuccess = true;
        this.registerError = '';
      },
      error: (err) => {
        console.error('Błąd rejestracji:', err);
        this.registerError = err.error?.message || 'Wystąpił błąd podczas rejestracji';
      }
    });
  }
  onSubmit() {
    if (this.mode == 'login') {
      this.loginSubmit();
    } else {
      this.registerSubmit();
    }
  }
  onInputChange() {
    this.loginError = false;
    this.registerError = '';
    this.registerSuccess = false;
  }

  setMode(mode: 'login' | 'register') {
    this.loginError = false;
    this.registerError = '';
    this.registerSuccess = false;
    this.mode = mode;
  }
  goToMechanic() {
    this.router.navigate(['/panel-site']);
  }
  goToUser() {
    this.router.navigate(['/panel-site']);
  }
  goToAdmin() {
    this.goToMechanic();
  }
}
