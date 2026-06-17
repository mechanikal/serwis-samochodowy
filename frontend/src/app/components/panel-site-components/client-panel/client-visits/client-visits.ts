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
  acceptEstimateConfirmationPopupOpen: boolean = false;
  cancelVisitConfirmationPopupOpen: boolean = false;

  showInfoBox: boolean = false;
  infoBoxText: string = '';


  ngOnInit(): void {
    this.fetchAppointments();
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  fetchAppointments() {
    this.http.get<any[]>('http://localhost:3000/api/client-visits', {
      headers: this.getAuthHeaders()
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
        this.clientFutureAppointments = this.clientAppointments.filter(e => e.status === 'nadchodzące');
        this.clientPastAppointments = this.clientAppointments.filter(e => e.status === 'zakończone' || e.status === 'anulowane');
        this.clientActiveAppointments = this.clientAppointments.filter(e => e.status !== 'nadchodzące' && e.status !== 'zakończone' && e.status !== 'anulowane');
      },
      error: (err) => console.error('Błąd pobierania wizyt w kalendarzu', err),
      complete: () => console.log('Pobrano wizyty w kalendarzu',this.clientAppointments)
    });
  }

  fetchAppointmentEstimate(visit :Appointment) {
    this.http.get<any>(`http://localhost:3000/api/visit-diagnosis/${visit._id}`, {
      headers: this.getAuthHeaders()
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
    this.popupDiagnosis = null;
    this.closeConfirmationPopup();
  }

  closeInfoBox(){
    this.showInfoBox = false;
    this.closePopup();
  }

  closeConfirmationPopup(){
    this.acceptEstimateConfirmationPopupOpen = false;
    this.cancelVisitConfirmationPopupOpen = false;
  }

  openAcceptEstimateConfirmationPopup(){
    this.acceptEstimateConfirmationPopupOpen = true;
  }

  openCancelVisitConfirmationPopup(){
    this.cancelVisitConfirmationPopupOpen = true;
  }

  confirmAcceptEstimate(){
    this.closeConfirmationPopup();
    this.acceptEstimate();
  }

  confirmCancelVisit(){
    this.closeConfirmationPopup();
    this.cancelVisit();
  }

  acceptEstimate(){
    if (this.popupVisit == null){
      return;
    }
    this.http.post(`http://localhost:3000/api/client-visits/accept/${this.popupVisit._id}`, {}, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (res) => {
        this.fetchAppointments();
        if (this.popupVisit != null){
          this.fetchAppointmentEstimate(this.popupVisit);
        }
        this.infoBoxText = 'kosztorys zatwierdzony';
        this.showInfoBox = true;
      },
      error: (err) => {
        this.infoBoxText = 'nie udało się zatwierdzić kosztorysu';
        this.showInfoBox = true;
      }
    });
  }

  cancelVisit(){
    if (this.popupVisit == null){
      return;
    }
    this.http.post(`http://localhost:3000/api/client-visits/cancel/${this.popupVisit._id}`, {}, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (res) => {
        this.fetchAppointments();
        this.infoBoxText = 'wizyta anulowana';
        this.showInfoBox = true;
      },
      error: (err) => {
        this.infoBoxText = 'nie udało się odwołać wizyty';
        this.showInfoBox = true;
      }
    });
  }

}
