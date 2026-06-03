import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Appointment {
  time: string;
  serviceName: string;
  clientName: string;
  dateStr?: string; // dodane do łatwiejszego filtrowania
}

interface DaySchedule {
  dayAbbr: string;
  dayNumber: number;
  appointments: Appointment[];
}

@Component({
  selector: 'client-visits',
  imports: [CommonModule, HttpClientModule],
  templateUrl: './client-visits.html',
  styleUrl: './client-visits.css',
})
export class ClientVisits implements OnInit {
  currentWeekStart: Date = this.getMonday(new Date());
  polishMonths: string[] = [
    'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
    'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'
  ];
  polishDays: string[] = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'];
  
  allAppointments: Appointment[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchAppointments();
  }

  fetchAppointments() {
    const token = localStorage.getItem('token');
    this.http.get<any[]>('http://localhost:3000/api/visits', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).subscribe({
      next: (data) => {
        this.allAppointments = data.map(v => ({
          time: v.time,
          serviceName: v.serviceName,
          clientName: v.clientName,
          dateStr: v.date
        }));
      },
      error: (err) => console.error('Błąd pobierania wizyt w kalendarzu', err)
    });
  }

  get monthYear(): string {
    const middleOfWeek = new Date(this.currentWeekStart);
    middleOfWeek.setDate(middleOfWeek.getDate() + 3);
    const month = this.polishMonths[middleOfWeek.getMonth()];
    const year = middleOfWeek.getFullYear();
    return `${month} ${year}`;
  }

  get weekDays(): DaySchedule[] {
    const days: DaySchedule[] = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date(this.currentWeekStart);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      days.push({
        dayAbbr: this.polishDays[i],
        dayNumber: date.getDate(),
        appointments: this.allAppointments.filter(a => a.dateStr === dateStr),
      });
    }
    return days;
  }

  previousWeek(): void {
    const newStart = new Date(this.currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    this.currentWeekStart = newStart;
  }

  nextWeek(): void {
    const newStart = new Date(this.currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    this.currentWeekStart = newStart;
  }

  onAppointmentClick(day: DaySchedule, appointment: Appointment): void {
    // Placeholder — will be implemented when button functionality is defined
    console.log('Clicked appointment:', day.dayAbbr, day.dayNumber, appointment);
  }

  private getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}
