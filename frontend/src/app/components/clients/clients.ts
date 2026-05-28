import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

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
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './clients.html',
  styleUrl: './clients.css',
})
export class Clients implements OnInit {
  filterText = '';
  clients: Client[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchClients();
  }

  fetchClients() {
    this.http.get<any[]>('http://localhost:3000/api/clients').subscribe({
      next: (data) => {
        this.clients = data.map(c => ({
          firstName: c.firstName,
          lastName: c.lastName,
          expanded: false,
          vehicles: c.vehicles,
          visits: c.visits
        }));
      },
      error: (err) => {
        console.error('Błąd podczas pobierania klientów:', err);
      }
    });
  }

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
