import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatItem {
  name: string;
  count: string;
}

interface StatSection {
  title: string;
  items: StatItem[];
}

@Component({
  selector: 'app-statistical-report',
  imports: [CommonModule],
  templateUrl: './statistical-report.html',
  styleUrl: './statistical-report.css',
})
export class StatisticalReport {
  sections: StatSection[] = [
    {
      title: 'statystyki występowania usterek',
      items: [
        { name: 'NAZWA USTERKI', count: 'ILOŚĆ' },
        { name: 'NAZWA USTERKI', count: 'ILOŚĆ' },
        { name: 'NAZWA USTERKI', count: 'ILOŚĆ' },
      ],
    },
    {
      title: 'statystyki wykonanych usług',
      items: [
        { name: 'NAZWA USŁUGI', count: 'ILOŚĆ' },
        { name: 'NAZWA USŁUGI', count: 'ILOŚĆ' },
        { name: 'NAZWA USŁUGI', count: 'ILOŚĆ' },
      ],
    },
  ];
}
