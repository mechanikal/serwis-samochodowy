import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Appointment{
  time: string;
  serviceName: string;
  clientName: string;
  dateStr: string;
  status: string;
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
          time: v.time,
          serviceName: v.serviceName,
          clientName: v.clientName,
          dateStr: v.date,
          status: v.status
        }));
        this.clientFutureAppointments = this.clientAppointments.filter(e => e.status == 'awaiting');
        this.clientPastAppointments = this.clientAppointments.filter(e => e.status == 'closed');
        this.clientActiveAppointments = this.clientAppointments.filter(e => e.status != 'awaiting' && e.status != 'closed');
      },
      error: (err) => console.error('Błąd pobierania wizyt w kalendarzu', err),
      complete: () => console.log('Pobrano wizyty w kalendarzu',this.clientAppointments)
    });
  }
  openVisitPopup(visit :Appointment){
    this.popupVisit = visit;
    this.popupDiagnosis = createMockDiagnosis();
    this.visitPopupOpen = true;
  }

  closePopup(){
    this.visitPopupOpen = false;
    this.popupVisit = null;
  }

}

function createMockDiagnosis(): Diagnosis {
  return {
    diagnosisDescription: 'Zużyty układ hamulcowy',

    faults: [
      {
        name: 'Zużyte klocki hamulcowe',
        description: 'Grubość okładzin poniżej normy'
      },
      {
        name: 'Porysowane tarcze',
        description: 'Widoczne głębokie rowki na powierzchni'
      }
    ],

    requiredServices: [
      {
        name: 'Wymiana klocków hamulcowych',
        price: '150'
      },
      {
        name: 'Wymiana tarcz hamulcowych',
        price: '200'
      }
    ],

    requiredParts: [
      {
        name: 'Komplet klocków hamulcowych',
        description: 'Przód',
        price: 180
      },
      {
        name: 'Tarcza hamulcowa',
        description: 'Przód lewa',
        price: 250
      },
      {
        name: 'Tarcza hamulcowa',
        description: 'Przód prawa',
        price: 250
      }
    ],

    totalPrice: 1030
  };
}