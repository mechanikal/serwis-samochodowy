import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface RepairItem {
  date: string;
  time: string;
  service: string;
  client: string;
}

interface RepairSection {
  name: string;
  expanded: boolean;
  items: RepairItem[];
}

@Component({
  selector: 'app-repairs',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './repairs.html',
  styleUrl: './repairs.css',
})
export class Repairs implements OnInit {
  filterText = '';
  sections: RepairSection[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchVisits();
  }

  fetchVisits() {
    this.http.get<any[]>('http://localhost:3000/api/visits').subscribe({
      next: (data) => {
        const aktualne: RepairItem[] = [];
        const nadchodzace: RepairItem[] = [];
        const zakoczone: RepairItem[] = [];

        const today = new Date().toISOString().split('T')[0];

        data.forEach(v => {
          const item: RepairItem = {
            date: v.date,
            time: v.time,
            service: v.serviceName,
            client: v.clientName
          };

          if (v.status.toLowerCase() === 'zakończone' || v.status.toLowerCase() === 'zakończona') {
            zakoczone.push(item);
          } else if (v.date > today) {
            nadchodzace.push(item);
          } else {
            aktualne.push(item);
          }
        });

        this.sections = [
          { name: 'aktualne', expanded: true, items: aktualne },
          { name: 'nadchodzące', expanded: true, items: nadchodzace },
          { name: 'zakończone', expanded: false, items: zakoczone },
        ];
      },
      error: (err) => {
        console.error('Błąd pobierania wizyt', err);
      }
    });
  }

  toggleSection(section: RepairSection): void {
    section.expanded = !section.expanded;
  }

  filteredItems(items: RepairItem[]): RepairItem[] {
    if (!this.filterText.trim()) {
      return items;
    }
    const query = this.filterText.toLowerCase();
    return items.filter(
      (item) =>
        item.date.toLowerCase().includes(query) ||
        item.time.toLowerCase().includes(query) ||
        item.service.toLowerCase().includes(query) ||
        item.client.toLowerCase().includes(query)
    );
  }
}
