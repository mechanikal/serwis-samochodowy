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
  editingCar: Vehicle | null = null;
  addVehiclePopupOpen: boolean = false;
  editVehiclePopupOpen: boolean = false;
  deleteConfirmationPopupOpen: boolean = false;
  vechicleForm = {
    brand: '',
    model: '',
    year: 2000,
    registration: '',
    VIN: '',

    id: ''
  }


  toggleCar(car: Vehicle): void {
    car.expanded = !car.expanded;
  }

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchClientCars();
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
  }
  closePopup() {
    this.addVehiclePopupOpen = false;
    this.editVehiclePopupOpen = false;
    this.deleteConfirmationPopupOpen = false;
  }
  openDeleteConfirmationPopup(car: Vehicle) {
    this.vechicleForm.registration = car.registration;
    this.vechicleForm.brand = car.brand;
    this.vechicleForm.model = car.model; 
    this.vechicleForm.year = car.year;
    this.vechicleForm.VIN = car.VIN;
    this.vechicleForm.id = car.id;
    this.deleteConfirmationPopupOpen = true;
  }
  deleteVehicleConfirm() {
  }
}
