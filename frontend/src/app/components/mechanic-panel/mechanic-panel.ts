import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Calendar } from '../calendar/calendar';
import { Clients } from '../clients/clients';
import { Repairs } from '../repairs/repairs';
import { StatisticalReport } from '../statistical-report/statistical-report';
import { ClientCars } from "../client-cars/client-cars";
import { ClientVisits } from "../../client-visits/client-visits";
import { ScheduleVisit } from "../../schedule-visit/schedule-visit";

@Component({
  selector: 'mechanic-panel',
  imports: [CommonModule, Calendar, Clients, Repairs, StatisticalReport, ClientCars, ClientVisits, ScheduleVisit],
  templateUrl: './mechanic-panel.html',
  styleUrl: './mechanic-panel.css',
})
export class MechanicPanel {
  selectedMode = 'klienci';
  mechanicOptions = ['klienci', 'kalendarz wizyt', 'naprawy', 'raport statystyczny'];
  clientOptions = ['moje wizyty', 'umów wizytę', 'moje pojazdy'];
  userModes = ['mechanic','client'];
  selectedUserMode = 'mechanic';
  options = this.mechanicOptions;

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
    //if (this.selectedUserMode === 'mechanic') {
    //  this.goToClient();
    //}
  }
  userMode(option: string) {
    this.selectedUserMode = option;
  }
}

