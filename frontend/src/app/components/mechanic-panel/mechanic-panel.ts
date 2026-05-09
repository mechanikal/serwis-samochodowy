import { Component } from '@angular/core';
@Component({
  selector: 'mechanic-panel',
  imports: [],
  templateUrl: './mechanic-panel.html',
  styleUrl: './mechanic-panel.css',
})
export class MechanicPanel {
  selectedMode = 'klienci';
  options = ['klienci', 'kalendarz', 'wizyty', 'naprawy', 'raport statystyczny'];

  selectMode(option: string) {
    this.selectedMode = option;
  }
}

