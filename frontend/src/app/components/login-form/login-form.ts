import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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
  //register
  repeatPasswordValue: string = '';
  nameValue: string = '';
  surnameValue: string = '';
  phoneValue: string = '';
  emailValue: string = '';

  mode: string = 'login';

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  loginSubmit() {
    this.goToMechanic();
    return;
  }

  registerSubmit() {
    const user = {
      username: this.nameValue + this.surnameValue,
      email: this.emailValue,
      password: this.passwordValue,
      first_name: this.nameValue,
      last_name: this.surnameValue,
      phone: this.phoneValue,
    };

    this.http.post('http://localhost:3000/api/register', user).subscribe({
      next: (res) => {
        console.log('Rejestracja OK:', res);
      },
      error: (err) => {
        console.error('Błąd rejestracji:', err);
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

  setMode(mode: 'login' | 'register') {
    this.mode = mode;
  }
  goToMechanic() {
    this.router.navigate(['/panel-site']);
  }
}
