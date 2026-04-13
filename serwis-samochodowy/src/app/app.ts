import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginForm } from "./login-form/login-form";
import { WaveBackground } from "./wave-background/wave-background";
import { Hero } from "./hero/hero";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoginForm, WaveBackground, Hero],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('serwis-samochodowy');
}
