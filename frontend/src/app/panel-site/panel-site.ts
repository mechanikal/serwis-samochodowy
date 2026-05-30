import { Component, OnInit } from '@angular/core';
import { SiteHeader } from '../components/panel-site-components/site-header/site-header';
import { MechanicPanel } from "../components/panel-site-components/panel/panel";
import { WaveBackground } from '../components/common/wave-background/wave-background';

@Component({
  selector: 'app-panel-site',
  imports: [SiteHeader, MechanicPanel, WaveBackground],
  templateUrl: './panel-site.html',
  styleUrl: './panel-site.css',
})
export class MechanicSite implements OnInit {
  selectedUserMode: 'mechanic' | 'client' = 'mechanic';

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    this.selectedUserMode = user.role === 'mechanic'
      ? 'mechanic'
      : 'client';
  }
}
