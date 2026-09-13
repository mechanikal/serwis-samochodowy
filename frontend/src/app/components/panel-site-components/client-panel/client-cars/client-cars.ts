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

interface Visit {
  _id: string;
  date: string;
  serviceName: string;
  status: string;
  description: string;
}

interface VehiclePayload {
  brand: string;
  model: string;
  year: number;
  registration: string;
  VIN: string;
}

@Component({
  selector: 'client-cars',
  imports: [FormsModule],
  templateUrl: './client-cars.html',
  styleUrl: './client-cars.css',
})
export class ClientCars {
  client_cars: Vehicle[] = [];
  addVehiclePopupOpen: boolean = false;
  editVehiclePopupOpen: boolean = false;
  deleteConfirmationPopupOpen: boolean = false;

  showInfoBox: boolean = false;
  infoBoxText: string = '';
  /** true = komunikat błędu, false = sukces */
  infoBoxIsError: boolean = false;

  /** Błędy poszczególnych pól formularza pojazdu */
  brandError: string = '';
  modelError: string = '';
  yearError: string = '';
  registrationError: string = '';
  VINError: string = '';

  vechicleForm = {
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    registration: '',
    VIN: '',
    id: ''
  };

  editingVehicle: Vehicle | null = null;
  deletingVehicle: Vehicle | null = null;

  toggleCar(car: Vehicle): void {
    car.expanded = !car.expanded;
  }

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchClientCars();
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return { 'Authorization': `Bearer ${token}` };
  }

  // ──────────────────────────────────────────────────────────
  // Walidacja formularza
  // ──────────────────────────────────────────────────────────

  private resetFieldErrors(): void {
    this.brandError = '';
    this.modelError = '';
    this.yearError = '';
    this.registrationError = '';
    this.VINError = '';
  }

  /**
   * Waliduje formularz, ustawia per-field errory i zwraca true gdy dane są poprawne.
   */
  validateForm(): boolean {
    this.resetFieldErrors();
    let valid = true;
    const f = this.vechicleForm;
    const maxYear = new Date().getFullYear() + 1;

    if (!f.brand.trim()) {
      this.brandError = 'Marka jest wymagana.';
      valid = false;
    } else if (f.brand.trim().length > 50) {
      this.brandError = 'Marka może mieć maksymalnie 50 znaków.';
      valid = false;
    }

    if (!f.model.trim()) {
      this.modelError = 'Model jest wymagany.';
      valid = false;
    } else if (f.model.trim().length > 50) {
      this.modelError = 'Model może mieć maksymalnie 50 znaków.';
      valid = false;
    }

    const yr = Number(f.year);
    if (f.year == null || isNaN(yr)) {
      this.yearError = 'Rok produkcji jest wymagany.';
      valid = false;
    } else if (!Number.isInteger(yr) || yr < 1900 || yr > maxYear) {
      this.yearError = `Rok produkcji musi być liczbą całkowitą z zakresu 1900–${maxYear}.`;
      valid = false;
    }

    const reg = f.registration.trim().toUpperCase();
    if (!reg) {
      this.registrationError = 'Numer rejestracyjny jest wymagany.';
      valid = false;
    } else if (!/^[A-Z0-9 \-]{3,12}$/.test(reg)) {
      this.registrationError = 'Nieprawidłowy format rejestracji. Dozwolone: duże litery, cyfry, spacja i myślnik (3–12 znaków). Przykład: WA 12345.';
      valid = false;
    }

    const vin = f.VIN.trim().toUpperCase();
    if (!vin) {
      this.VINError = 'VIN jest wymagany.';
      valid = false;
    } else if (!/^[A-HJ-NPR-Z1-9]{17}$/.test(vin)) {
      this.VINError = 'Nieprawidłowy format VIN. Wymagane dokładnie 17 znaków: wielkie litery (bez I, O, Q) oraz cyfry 1–9.';
      valid = false;
    }

    return valid;
  }

  isVehicleFormInvalid(): boolean {
    // Używane tylko jako fallback dla [disabled] – walidacja jest wywoływana przy kliknięciu
    const f = this.vechicleForm;
    return !f.brand.trim() || !f.model.trim() || !f.registration.trim() || !f.VIN.trim() || f.year == null;
  }

  // ──────────────────────────────────────────────────────────
  // CRUD
  // ──────────────────────────────────────────────────────────

  deleteClientCar(car: Vehicle) {
    this.http.delete(`http://localhost:3000/api/client-cars/${car.id}`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: () => {
        this.fetchClientCars();
        this.infoBoxText = 'Pojazd został usunięty.';
        this.infoBoxIsError = false;
        this.showInfoBox = true;
        this.closePopup();
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Nie udało się usunąć pojazdu.';
        this.infoBoxText = msg;
        this.infoBoxIsError = true;
        this.showInfoBox = true;
        // Popup potwierdzenia usunięcia pozostaje otwarty
      }
    });
  }

  addClientCar(car: VehiclePayload) {
    this.http.post(`http://localhost:3000/api/client-cars`, car, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: () => {
        this.fetchClientCars();
        this.infoBoxText = 'Pojazd został dodany pomyślnie.';
        this.infoBoxIsError = false;
        this.showInfoBox = true;
        this.closePopup();
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Nie udało się dodać pojazdu.';
        this.infoBoxText = msg;
        this.infoBoxIsError = true;
        this.showInfoBox = true;
        // Popup dodawania pozostaje otwarty – użytkownik może poprawić dane
      }
    });
  }

  modifyClientCar(carId: string, car: VehiclePayload) {
    this.http.put(`http://localhost:3000/api/client-cars/${carId}`, car, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: () => {
        this.fetchClientCars();
        this.infoBoxText = 'Pojazd został zmodyfikowany pomyślnie.';
        this.infoBoxIsError = false;
        this.showInfoBox = true;
        this.closePopup();
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Nie udało się edytować pojazdu.';
        this.infoBoxText = msg;
        this.infoBoxIsError = true;
        this.showInfoBox = true;
        // Popup edycji pozostaje otwarty – użytkownik może poprawić dane
      }
    });
  }

  fetchClientCars() {
    this.http.get<any[]>('http://localhost:3000/api/client-cars', {
      headers: this.getAuthHeaders()
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

  // ──────────────────────────────────────────────────────────
  // Popup management
  // ──────────────────────────────────────────────────────────

  openAddVehiclePopup() {
    this.resetFieldErrors();
    this.showInfoBox = false;
    this.addVehiclePopupOpen = true;
    this.vechicleForm = {
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      registration: '',
      VIN: '',
      id: ''
    };
  }

  openEditVehiclePopup(car: Vehicle) {
    this.resetFieldErrors();
    this.showInfoBox = false;
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
    this.editingVehicle = null;
    this.deletingVehicle = null;
    this.resetFieldErrors();
    this.showInfoBox = false;
  }

  closeInfoBox() {
    this.showInfoBox = false;
    // Przy błędzie serwera popup pozostaje otwarty
    // Przy sukcesie closePopup() już wywołano z wewnątrz subskrypcji
  }

  openDeleteConfirmationPopup(car: Vehicle) {
    this.resetFieldErrors();
    this.showInfoBox = false;
    this.vechicleForm.registration = car.registration;
    this.vechicleForm.brand = car.brand;
    this.vechicleForm.model = car.model;
    this.vechicleForm.year = car.year;
    this.vechicleForm.VIN = car.VIN;
    this.vechicleForm.id = car.id;
    this.deleteConfirmationPopupOpen = true;
    this.deletingVehicle = car;
  }

  // ──────────────────────────────────────────────────────────
  // Akcje formularza
  // ──────────────────────────────────────────────────────────

  deleteVehicleConfirm() {
    if (this.deletingVehicle != null) {
      this.deleteClientCar(this.deletingVehicle);
    }
  }

  editVehicleConfirm() {
    if (!this.validateForm()) return;
    if (this.editingVehicle != null) {
      this.modifyClientCar(this.editingVehicle.id, this.getVehiclePayloadFromForm());
    }
  }

  addVehicleConfirm() {
    if (!this.validateForm()) return;
    this.addClientCar(this.getVehiclePayloadFromForm());
  }

  private getVehiclePayloadFromForm(): VehiclePayload {
    return {
      brand: this.vechicleForm.brand.trim(),
      model: this.vechicleForm.model.trim(),
      year: this.vechicleForm.year,
      registration: this.vechicleForm.registration.trim(),
      VIN: this.vechicleForm.VIN.trim()
    };
  }
}
