import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Calendar } from '../mechanic panel/calendar/calendar';
import { Clients } from '../mechanic panel/clients/clients';
import { Repairs } from '../mechanic panel/repairs/repairs';
import { StatisticalReport } from '../mechanic panel/statistical-report/statistical-report';
import { ClientCars } from "../client-panel/client-cars/client-cars";
import { ClientVisits } from "../client-panel/client-visits/client-visits";
import { ScheduleVisit } from "../client-panel/schedule-visit/schedule-visit";

@Component({
  selector: 'mechanic-panel',
  imports: [CommonModule, Calendar, Clients, Repairs, StatisticalReport, ClientCars, ClientVisits, ScheduleVisit],
  templateUrl: './panel.html',
  styleUrl: './panel.css',
})
export class MechanicPanel {
  selectedMode = 'klienci';
  mechanicOptions = ['klienci', 'kalendarz wizyt', 'naprawy', 'raport statystyczny'];
  clientOptions = ['moje wizyty', 'umów wizytę', 'moje pojazdy'];
  selectedUserMode: 'mechanic' | 'client' = 'mechanic';
  options = this.mechanicOptions;

  @Input() set userMode(mode: 'mechanic' | 'client') {
    if (mode === 'mechanic') {
      this.goToMechanic();
    } else {
      this.goToClient();
    }
  }

  goToMechanic() {
    this.selectedUserMode = 'mechanic';
    this.options = this.mechanicOptions;
    this.selectedMode = 'klienci';
  }
  goToClient() {
    this.selectedUserMode = 'client';
    this.options = this.clientOptions;
    this.selectedMode = 'moje wizyty';
  }
  selectMode(option: string) {
    this.selectedMode = option;
  }
}

