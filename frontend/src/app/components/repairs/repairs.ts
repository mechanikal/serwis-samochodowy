import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './repairs.html',
  styleUrl: './repairs.css',
})
export class Repairs {
  filterText = '';

  sections: RepairSection[] = [
    {
      name: 'aktualne',
      expanded: true,
      items: [
        { date: 'DATA', time: 'GODZINA', service: 'USŁUGA', client: 'KLIENT' },
        { date: 'DATA', time: 'GODZINA', service: 'USŁUGA', client: 'KLIENT' },
      ],
    },
    {
      name: 'nadchodzące',
      expanded: true,
      items: [
        { date: 'DATA', time: 'GODZINA', service: 'USŁUGA', client: 'KLIENT' },
        { date: 'DATA', time: 'GODZINA', service: 'USŁUGA', client: 'KLIENT' },
      ],
    },
    {
      name: 'zakończone',
      expanded: false,
      items: [
        { date: 'DATA', time: 'GODZINA', service: 'USŁUGA', client: 'KLIENT' },
        { date: 'DATA', time: 'GODZINA', service: 'USŁUGA', client: 'KLIENT' },
      ],
    },
  ];

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
