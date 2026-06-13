import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface Vehicle {
  brand: string;
  model: string;
  year: number;
  registration: string;
  VIN: string;
  id: string;
  visits: Visit[];

  expanded: boolean;
}

interface Visit{
      _id: string;
      date: string;
      serviceName: string,
      status: string,
      description: string
}

@Component({
  selector: 'client-cars',
  imports: [FormsModule],
  templateUrl: './client-cars.html',
  styleUrl: './client-cars.css',
})
export class ClientCars {
  client_cars: Vehicle[] = []
  addVehiclePopupOpen: boolean = false;
  editVehiclePopupOpen: boolean = false;
  deleteConfirmationPopupOpen: boolean = false;
  showInfoBox: boolean = false;
  infoBoxText: string = '';
  vechicleForm = {
    brand: '',
    model: '',
    year: 2000,
    registration: '',
    VIN: '',

    id: ''
  }

  editingVehicle : Vehicle | null = null;
  deletingVehicle  : Vehicle | null = null;

  toggleCar(car: Vehicle): void {
    car.expanded = !car.expanded;
  }

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchClientCars();
  }


  deleteClientCar(car:Vehicle){
    this.http.delete(`http://localhost:3000/api/client-cars/${car.id}`,)
      .subscribe({
        next: (res) => {
        this.infoBoxText = 'pojazd usunięty';
        this.showInfoBox = true;
      },
      error: (err) => {
        this.infoBoxText = 'nie udało się usunąć pojazdu';
        this.showInfoBox = true;
      }
    });
  }

  addClientCar(car:Vehicle){
    this.http.post(`http://localhost:3000/api/client-cars`, car)
      .subscribe({
        next: (res) => {
        this.infoBoxText = 'pojazd dodany';
        this.showInfoBox = true;
      },
      error: (err) => {
        this.infoBoxText = 'nie udało się dodać pojazdu';
        this.showInfoBox = true;
      }
    });
  }

  modifyClientCar(car:Vehicle){
    this.http.put(`http://localhost:3000/api/client-cars/${car.id}`, car)
      .subscribe({
        next: (res) => {
        this.infoBoxText = 'pojazd zmodyfikowany';
        this.showInfoBox = true;
      },
      error: (err) => {
        this.infoBoxText = 'nie udało się edytować pojazdu';
        this.showInfoBox = true;
      }
    });
  }

  fetchClientCars() {
    const token = localStorage.getItem('token');
    this.http.get<any[]>('http://localhost:3000/api/client-cars', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).subscribe({
      next: (data) => {
        this.client_cars = data.map(c => ({
          brand: c.brand,
          model: c.model ?? '',
          year: c.year,
          registration: c.registration,
          VIN: c.VIN,
          visits: c.visits,
          expanded: false,
          id: c._id
        }));
      },
      error: (err) => {
        console.error('Błąd podczas pobierania samochodów klienta:', err);
      }
    });
  }
  openAddVehiclePopup() {
    this.addVehiclePopupOpen = true;
    this.vechicleForm = {
      brand: '',
      model: '',
      year: 2000,
      registration: '',
      VIN: '',
      id: ''
    }
  }
  openEditVehiclePopup(car : Vehicle) {
    this.vechicleForm.registration = car.registration;
    this.vechicleForm.brand = car.brand;
    this.vechicleForm.model = car.model;
    this.vechicleForm.year = car.year;
    this.vechicleForm.VIN = car.VIN;
    this.vechicleForm.id = car.id;
    this.editVehiclePopupOpen = true;
    this.editingVehicle = car;
  }
  closePopup() {
    this.addVehiclePopupOpen = false;
    this.editVehiclePopupOpen = false;
    this.deleteConfirmationPopupOpen = false;
  }
  closeInfoBox() {
    this.showInfoBox = false;
    this.closePopup();
  }
  isVehicleFormInvalid(): boolean {
    return this.vechicleForm.brand.trim().length === 0 ||
      this.vechicleForm.model.trim().length === 0 ||
      this.vechicleForm.registration.trim().length === 0 ||
      this.vechicleForm.VIN.trim().length === 0 ||
      this.vechicleForm.year == null;
  }
  openDeleteConfirmationPopup(car: Vehicle) {
    this.vechicleForm.registration = car.registration;
    this.vechicleForm.brand = car.brand;
    this.vechicleForm.model = car.model; 
    this.vechicleForm.year = car.year;
    this.vechicleForm.VIN = car.VIN;
    this.vechicleForm.id = car.id;
    this.deleteConfirmationPopupOpen = true;
    this.deletingVehicle =  car;
  }

  deleteVehicleConfirm() {
    if (this.deletingVehicle != null){
      this.deleteClientCar(this.deletingVehicle);
    }
  }

  editVehicleConfirm() {
    if (this.editingVehicle != null){
      this.modifyClientCar(this.editingVehicle);
    }
  }

addVehicleConfirm() {
    if (this.deletingVehicle != null){
      const newVehicle : Vehicle = {
        brand: this.vechicleForm.brand,
        model: this.vechicleForm.model,
        year: this.vechicleForm.year,
        registration: this.vechicleForm.registration,
        VIN: this.vechicleForm.VIN,
        visits: [],
        id: '',
        expanded: false
      }
      this.addClientCar(newVehicle);
    }
  }
}
