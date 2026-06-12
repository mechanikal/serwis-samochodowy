import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface CarInfo{
  model: string;
  brand: string;
  registration: string;
  VIN: string;
}

interface Appointment{
  _id: string;
  time: string;
  serviceName: string;
  clientName: string;
  dateStr: string;
  status: string;
  description: string;
  car: CarInfo;
}

interface Fault{
  name: String;
  description: String;
}

interface Service{
  name: String;
  price:string
}

interface Part{
  name: String;
  description: String;
  price: Number;
}

interface Diagnosis{
  diagnosisDescription: String,
  faults: Fault[];
  requiredServices: Service[],
  requiredParts: Part[];
  totalPrice: Number;
  accepted: boolean;
}


@Component({
  selector: 'client-visits',
  imports: [CommonModule, HttpClientModule],
  templateUrl: './client-visits.html',
  styleUrl: './client-visits.css',
})
export class ClientVisits implements OnInit {
  constructor(private http: HttpClient) {}

  clientAppointments : Appointment[] = [];

  clientFutureAppointments : Appointment[] = [];
  clientActiveAppointments : Appointment[] = [];
  clientPastAppointments : Appointment[] = [];
  activeExpanded : boolean = true;
  futureExpanded : boolean = true;
  pastExpanded : boolean = false;

  visitPopupOpen :boolean = false;
  popupVisit :Appointment | null = null;
  popupDiagnosis : Diagnosis | null = null;

  ngOnInit(): void {
    this.fetchAppointments();
  }

  fetchAppointments() {
    const token = localStorage.getItem('token');
    this.http.get<any[]>('http://localhost:3000/api/client-visits', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).subscribe({
      next: (data) => {
        this.clientAppointments = data.map(v => ({
          _id: v._id,
          time: v.time,
          serviceName: v.serviceName,
          clientName: v.clientName,
          dateStr: v.date,
          status: v.status,
          description: v.description,
          car: v.vehicle
        }));
        this.clientFutureAppointments = this.clientAppointments.filter(e => e.status == 'awaiting');
        this.clientPastAppointments = this.clientAppointments.filter(e => e.status == 'closed');
        this.clientActiveAppointments = this.clientAppointments.filter(e => e.status != 'awaiting' && e.status != 'closed');
      },
      error: (err) => console.error('Błąd pobierania wizyt w kalendarzu', err),
      complete: () => console.log('Pobrano wizyty w kalendarzu',this.clientAppointments)
    });
  }

  fetchAppointmentEstimate(visit :Appointment) {
    const token = localStorage.getItem('token');
    this.http.get<any>(`http://localhost:3000/api/visit-diagnosis/${visit._id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).subscribe({
      next: (data) => {
        this.popupDiagnosis = {
          diagnosisDescription: data.diagnosisDescription,
          faults: data.faults,
          requiredServices: data.requiredServices,
          requiredParts: data.requiredParts,
          totalPrice: data.totalPrice,
          accepted: data.accepted,
        };
      },
      error: (err) => console.error('błąd pobierania wizyty', err),
      complete: () => console.log('Pobrano kosztorys wizyty',this.popupDiagnosis)
    });
  }

  openVisitPopup(visit :Appointment){
    this.popupVisit = visit;
    this.fetchAppointmentEstimate(visit);
    this.visitPopupOpen = true;
  }

  closePopup(){
    this.visitPopupOpen = false;
    this.popupVisit = null;
  }

}
