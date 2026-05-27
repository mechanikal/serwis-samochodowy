import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Visit {
  serviceName: string;
  status: string;
  date: string;
}

interface Vehicle {
  brand: string;
  registration: string;
}

interface Client {
  firstName: string;
  lastName: string;
  expanded: boolean;
  vehicles: Vehicle[];
  visits: Visit[];
}

@Component({
  selector: 'app-clients',
  imports: [CommonModule, FormsModule],
  templateUrl: './clients.html',
  styleUrl: './clients.css',
})
export class Clients {
  filterText = '';

  clients: Client[] = [
    {
      firstName: 'Imię',
      lastName: 'Nazwisko',
      expanded: true,
      vehicles: [{ brand: 'MARKA', registration: 'REJESTRACJA' }],
      visits: [
        { serviceName: 'NAZWA USŁUGI', status: 'STATUS', date: 'DATA' },
        { serviceName: 'NAZWA USŁUGI', status: 'STATUS', date: 'DATA' },
        { serviceName: 'NAZWA USŁUGI', status: 'STATUS', date: 'DATA' },
      ],
    },
    {
      firstName: 'Imię',
      lastName: 'Nazwisko',
      expanded: false,
      vehicles: [{ brand: 'MARKA', registration: 'REJESTRACJA' }],
      visits: [
        { serviceName: 'NAZWA USŁUGI', status: 'STATUS', date: 'DATA' },
        { serviceName: 'NAZWA USŁUGI', status: 'STATUS', date: 'DATA' },
        { serviceName: 'NAZWA USŁUGI', status: 'STATUS', date: 'DATA' },
      ],
    },
    {
      firstName: 'Imię',
      lastName: 'Nazwisko',
      expanded: false,
      vehicles: [{ brand: 'MARKA', registration: 'REJESTRACJA' }],
      visits: [
        { serviceName: 'NAZWA USŁUGI', status: 'STATUS', date: 'DATA' },
        { serviceName: 'NAZWA USŁUGI', status: 'STATUS', date: 'DATA' },
        { serviceName: 'NAZWA USŁUGI', status: 'STATUS', date: 'DATA' },
      ],
    },
    {
      firstName: 'Imię',
      lastName: 'Nazwisko',
      expanded: false,
      vehicles: [{ brand: 'MARKA', registration: 'REJESTRACJA' }],
      visits: [
        { serviceName: 'NAZWA USŁUGI', status: 'STATUS', date: 'DATA' },
        { serviceName: 'NAZWA USŁUGI', status: 'STATUS', date: 'DATA' },
        { serviceName: 'NAZWA USŁUGI', status: 'STATUS', date: 'DATA' },
      ],
    },
    {
      firstName: 'Imię',
      lastName: 'Nazwisko',
      expanded: true,
      vehicles: [{ brand: 'MARKA', registration: 'REJESTRACJA' }],
      visits: [
        { serviceName: 'NAZWA USŁUGI', status: 'STATUS', date: 'DATA' },
        { serviceName: 'NAZWA USŁUGI', status: 'STATUS', date: 'DATA' },
        { serviceName: 'NAZWA USŁUGI', status: 'STATUS', date: 'DATA' },
      ],
    },
  ];

  toggleClient(client: Client): void {
    client.expanded = !client.expanded;
  }

  get filteredClients(): Client[] {
    if (!this.filterText.trim()) {
      return this.clients;
    }
    const query = this.filterText.toLowerCase();
    return this.clients.filter(
      (c) =>
        c.firstName.toLowerCase().includes(query) ||
        c.lastName.toLowerCase().includes(query) ||
        c.vehicles.some(
          (v) =>
            v.brand.toLowerCase().includes(query) ||
            v.registration.toLowerCase().includes(query)
        )
    );
  }
}
