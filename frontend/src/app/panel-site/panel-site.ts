import { Component } from '@angular/core';
import { SiteHeader } from '../components/site-header/site-header';
import { MechanicPanel } from "../components/panel/panel";
import { WaveBackground } from '../components/wave-background/wave-background';

@Component({
  selector: 'app-panel-site',
  imports: [SiteHeader, MechanicPanel, WaveBackground],
  templateUrl: './panel-site.html',
  styleUrl: './panel-site.css',
})
export class MechanicSite {}
