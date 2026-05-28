import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

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
  imports: [CommonModule, HttpClientModule],
  templateUrl: './statistical-report.html',
  styleUrl: './statistical-report.css',
})
export class StatisticalReport implements OnInit {
  sections: StatSection[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchStats();
  }

  fetchStats() {
    this.http.get<any>('http://localhost:3000/api/stats').subscribe({
      next: (data) => {
        this.sections = [
          {
            title: 'statystyki występowania usterek',
            items: data.faults
          },
          {
            title: 'statystyki wykonanych usług',
            items: data.services
          }
        ];
      },
      error: (err) => console.error('Błąd pobierania statystyk', err)
    });
  }
}
