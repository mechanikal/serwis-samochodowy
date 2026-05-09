import { Component } from '@angular/core';
import { SiteHeader } from '../components/site-header/site-header';
import { MechanicPanel } from "../components/mechanic-panel/mechanic-panel";
import { WaveBackground } from '../components/wave-background/wave-background';

@Component({
  selector: 'app-mechanic-site',
  imports: [SiteHeader, MechanicPanel, WaveBackground],
  templateUrl: './mechanic-site.html',
  styleUrl: './mechanic-site.css',
})
export class MechanicSite {}
