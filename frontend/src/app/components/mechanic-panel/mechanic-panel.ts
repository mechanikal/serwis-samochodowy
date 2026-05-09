import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Calendar } from '../calendar/calendar';
import { Clients } from '../clients/clients';
import { Repairs } from '../repairs/repairs';
import { Visits } from '../visits/visits';
import { StatisticalReport } from '../statistical-report/statistical-report';

@Component({
  selector: 'mechanic-panel',
  imports: [CommonModule, Calendar, Clients, Repairs, Visits, StatisticalReport],
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

