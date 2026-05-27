import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Appointment {
  time: string;
  serviceName: string;
  clientName: string;
}

interface DaySchedule {
  dayAbbr: string;
  dayNumber: number;
  appointments: Appointment[];
}

@Component({
  selector: 'app-calendar',
  imports: [CommonModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
})
export class Calendar {
  currentWeekStart: Date = this.getMonday(new Date());
  polishMonths: string[] = [
    'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
    'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'
  ];
  polishDays: string[] = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'];

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
      days.push({
        dayAbbr: this.polishDays[i],
        dayNumber: date.getDate(),
        appointments: this.getMockAppointments(),
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

  private getMockAppointments(): Appointment[] {
    return [
      { time: 'GODZINA', serviceName: 'NAZWA USŁUGI', clientName: 'DANE KLIENTA' },
      { time: 'GODZINA', serviceName: 'NAZWA USŁUGI', clientName: 'DANE KLIENTA' },
      { time: 'GODZINA', serviceName: 'NAZWA USŁUGI', clientName: 'DANE KLIENTA' },
      { time: 'GODZINA', serviceName: 'NAZWA USŁUGI', clientName: 'DANE KLIENTA' },
      { time: 'GODZINA', serviceName: 'NAZWA USŁUGI', clientName: 'DANE KLIENTA' },
    ];
  }
}
