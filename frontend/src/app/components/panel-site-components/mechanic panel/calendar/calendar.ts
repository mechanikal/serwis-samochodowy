import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Appointment {
  time: string;
  serviceName: string;
  clientName: string;
  dateStr?: string;
  status?: string;
}

interface HourSlot {
  hour: number;        // 8, 9, ... 20
  label: string;       // '8:00', '9:00', ... '20:00'
  endLabel: string;    // '9:00', '10:00', ... '21:00'
  appointments: Appointment[];
}

interface DaySchedule {
  dayAbbr: string;
  dayNumber: number;
  slots: HourSlot[];
  appointments: Appointment[]; // kept for onAppointmentClick signature compatibility
}

interface PopupVisit {
  clientName: string;
  serviceName: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  status: string;
}

// Working hours: 8:00 – 20:00 (13 slots)
const HOUR_START = 8;
const HOUR_END   = 20;

const STATUS_LABELS: Record<string, string> = {
  'nadchodzące':                              'Nadchodzące',
  'oczekiwanie na kosztorys':                'Oczekiwanie na kosztorys',
  'oczekiwanie na zatwierdzenie kosztorysu': 'Oczekiwanie na zatw. kosztorysu',
  'w trakcie naprawy':                       'W trakcie naprawy',
  'zakończone':                              'Zakończone',
  'anulowane':                               'Anulowane',
  // legacy fallbacks
  'oczekuje':   'Nadchodzące',
  'w trakcie':  'W trakcie naprawy',
  'zakończona': 'Zakończone',
  'anulowana':  'Anulowane',
};

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, HttpClientModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
})
export class Calendar implements OnInit {
  currentWeekStart: Date = this.getMonday(new Date());
  polishMonths: string[] = [
    'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
    'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'
  ];
  polishDays: string[] = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'];

  allAppointments: Appointment[] = [];

  // Popup state
  popupVisit: PopupVisit | null = null;

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
          dateStr: v.date,
          status: v.status,
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

  /** Parse 'HH:MM' or 'H:MM' → integer hour */
  private parseHour(timeStr: string): number {
    if (!timeStr) return -1;
    const parts = timeStr.split(':');
    return parseInt(parts[0], 10);
  }

  get weekDays(): DaySchedule[] {
    const days: DaySchedule[] = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date(this.currentWeekStart);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      // Filter appointments for this day, sorted by time
      const dayApts = this.allAppointments
        .filter(a => a.dateStr === dateStr)
        .sort((a, b) => this.parseHour(a.time) - this.parseHour(b.time));

      // Build hourly slots 8 → 20 (inclusive)
      const slots: HourSlot[] = [];
      for (let h = HOUR_START; h <= HOUR_END; h++) {
        const label = `${h}:00`;
        const endLabel = `${h + 1}:00`;
        const appointments = dayApts.filter(a => this.parseHour(a.time) === h);
        slots.push({ hour: h, label, endLabel, appointments });
      }

      days.push({
        dayAbbr: this.polishDays[i],
        dayNumber: date.getDate(),
        slots,
        appointments: dayApts,
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

  onAppointmentClick(day: DaySchedule, slot: HourSlot): void {
    const apt = slot.appointments[0];
    // Format date as DD.MM.YYYY
    const [y, m, d] = (apt.dateStr ?? '').split('-');
    const dateFormatted = apt.dateStr ? `${d}.${m}.${y}` : '—';

    this.popupVisit = {
      clientName:  apt.clientName,
      serviceName: apt.serviceName,
      date:        dateFormatted,
      timeStart:   slot.label,
      timeEnd:     slot.endLabel,
      status:      STATUS_LABELS[apt.status ?? ''] ?? apt.status ?? '—',
    };
  }

  closePopup(): void {
    this.popupVisit = null;
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
