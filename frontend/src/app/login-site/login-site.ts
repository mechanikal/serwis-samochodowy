import { Component, signal } from '@angular/core';
import { LoginForm } from "../components/login-site-components/login-form/login-form";
import { WaveBackground } from "../components/common/wave-background/wave-background";
import { Hero } from "../components/login-site-components/hero/hero";

@Component({
  selector: 'app-login-site',
  imports: [LoginForm, WaveBackground, Hero],
  templateUrl: './login-site.html',
  styleUrl: './login-site.css',
})
export class LoginSite {}
