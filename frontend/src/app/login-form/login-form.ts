import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'login-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login-form.html',
  styleUrl: './login-form.css'
})
export class LoginForm {
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

  loginSubmit() {
    //todo: login logic
    return
  }
  registerSubmit(){ 
    //todo: register logic
    return
  }
  onSubmit(){
    if (this.mode == 'login'){
      this.loginSubmit()
    }
    else{
      this.registerSubmit()
    }
  }

  setMode(mode: 'login' | 'register') {
  this.mode = mode;
  }
}