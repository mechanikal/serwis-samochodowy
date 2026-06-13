import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ClientCars } from '../client-cars/client-cars';

interface Appointment {
  time: string;
  serviceName: string;
  clientName: string;
  dateStr?: string; // dodane do łatwiejszego filtrowania
}

interface TimeSlot {
  day:number
  dateStr: string; // dodane do łatwiejszego filtrowania
  startHour: string;
  endHour: string;
  free: boolean;
}

interface DaySchedule {
  dayAbbr: string;
  dayNumber: number;
  appointments: Appointment[];
}

interface ClientCar {
  brand: string;
  model: string;
  registration: string;
  _id: string;
}


@Component({
  selector: 'schedule-visit',
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './schedule-visit.html',
  styleUrl: './schedule-visit.css',
})
export class ScheduleVisit implements OnInit {
  currentWeekStart: Date = this.getMonday(new Date());
  polishMonths: string[] = [
    'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
    'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'
  ];
  polishDays: string[] = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'];
  
  allAppointments: Appointment[] = [];
  weekTimeSlots: TimeSlot[] = [];
  selectedTimeSlot: TimeSlot|null = null;

  clientCars :ClientCar[] = [];

  confirmPopupShown :boolean = false;
  selectedClientCar: ClientCar | null = null;
  visitDescription: string = '';
  showInfoBox: boolean = false;
  infoBoxText: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchAppointments();
    this.fetchClientCars();
    this.selectedTimeSlot = null;
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
        this.weekTimeSlots = this.generateWeekTimeSlots();
      },
      error: (err) => console.error('Błąd pobierania wizyt w kalendarzu', err),
      complete: () => console.log('Pobrano wizyty w kalendarzu',this.allAppointments)
    });
  }
  postVisit(){
    const token = localStorage.getItem('token');
    //todo: send request to backend
  }

  fetchClientCars() {
    const token = localStorage.getItem('token');
    this.http.get<any[]>('http://localhost:3000/api/client-cars', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).subscribe({
      next: (data) => {
        this.clientCars = data.map(c => ({
          brand: c.brand,
          model: c.model ?? '',
          registration: c.registration,
          _id: c._id
        }));
      },
      error: (err) => {
        console.error('Błąd podczas pobierania samochodów klienta:', err);
      }
    });
  }


  selectTimeSlot(slot:TimeSlot){
    if (slot.free){
      this.selectedTimeSlot = slot;
    }
  }

  generateWeekTimeSlots(): TimeSlot[] {
    const slots: TimeSlot[] = [];
    for (let dayOffset = 0; dayOffset < 6; dayOffset++) {
      for (let hour = 8; hour <= 20; hour++) {
        var dateData = new Date(this.currentWeekStart);
        dateData.setDate(dateData.getDate() + dayOffset);
        var dateStr = dateData.toISOString().split('T')[0];
        slots.push({
          day: dayOffset,
          dateStr: dateStr,
          startHour: `${hour}:00`,
          endHour: `${hour + 1}:00`,
          free: !this.isSlotTaken(dateStr,hour) && this.isSlotInFuture(dateStr,hour)
        });
      }
    }
    return slots;
  }

  getDaySlots(dayOffset: number): TimeSlot[] {
    return this.weekTimeSlots.filter(slot => slot.day === dayOffset);
  }

  filterTimeSlots(): void {

  }

  isSlotTaken(slotDateStr:string,slotTime:number): boolean {
    const filteredAppointments = this.allAppointments.filter(a => a.dateStr === slotDateStr);
    return filteredAppointments.some(app => app.time === `${slotTime}:00`);
  }

  isSlotInFuture(dateStr:string, hour:number): boolean {
    const [year, month, day] = dateStr.split('-').map(Number);
    const slotDate = new Date(year, month - 1, day, hour);

    return slotDate > new Date();
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
    if (newStart < this.getMonday(new Date())){
      return; // Nie pozwalamy cofać się do przeszłości
    }
    this.currentWeekStart = newStart;
    this.weekTimeSlots = this.generateWeekTimeSlots();
  }

  nextWeek(): void {
    const newStart = new Date(this.currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    this.currentWeekStart = newStart;
    this.weekTimeSlots = this.generateWeekTimeSlots();
  }

  onAppointmentClick(day: DaySchedule, slot: TimeSlot): void {
    this.selectTimeSlot(slot);
    console.log('Clicked appointment:', day.dayAbbr, day.dayNumber, slot);
  }

  private getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    var shift = - day;
    if (day == 0 || day == 6){
      shift += 7
    }
    const diff = d.getDate() + shift + 1;
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  visitSchedule(){
    this.confirmPopupShown = true;
  }
  closeInfoBox(){
    this.showInfoBox = false;
    this.confirmPopupShown = false;
  }
  scheduleVisit(){

  }

}
