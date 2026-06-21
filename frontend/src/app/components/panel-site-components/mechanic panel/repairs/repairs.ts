import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface RepairItem {
  _id: string;
  date: string;
  time: string;
  service: string;
  client: string;
  status: string;
  description: string;
  vehicle?: {
    brand: string;
    model: string;
    year: number;
    registration: string;
    VIN: string;
  } | null;
}

interface RepairSection {
  name: string;
  items: RepairItem[];
  expanded: boolean;
}

interface Fault {
  _id: string;
  name: string;
  description: string;
}

interface Service {
  _id: string;
  name: string;
  price: number;
}

interface Part {
  _id: string;
  name: string;
  description: string;
  price: number;
}

@Component({
  selector: 'app-repairs',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './repairs.html',
  styleUrl: './repairs.css',
})
export class Repairs implements OnInit {
  filterText = '';
  sections: RepairSection[] = [];

  deleteConfirmationOpen = false;
  pendingDeleteItem: RepairItem | null = null;
  pendingDeleteSection: RepairSection | null = null;

  cancelConfirmationOpen = false;

  popupItem: RepairItem | null = null;

  // Dictionaries for diagnosis
  faultsList: Fault[] = [];
  servicesList: Service[] = [];
  partsList: Part[] = [];

  // Diagnosis form state
  diagDescription: string = '';
  diagSelectedFaults: string[] = [];
  diagSelectedServices: { id: string, price: number }[] = [];
  diagSelectedParts: { id: string, price: number }[] = [];

  get diagTotalPrice(): number {
    const sPrice = this.diagSelectedServices.reduce((acc, p) => acc + p.price, 0);
    const pPrice = this.diagSelectedParts.reduce((acc, p) => acc + p.price, 0);
    return sPrice + pPrice;
  }

  get isDiagnosisValid(): boolean {
    return this.diagDescription.trim() !== '';
  }

  toggleFault(id: string) {
    const idx = this.diagSelectedFaults.indexOf(id);
    if (idx > -1) this.diagSelectedFaults.splice(idx, 1);
    else this.diagSelectedFaults.push(id);
  }

  addService(id: string) {
    this.diagSelectedServices.push({ id, price: this.getServicePrice(id) });
  }

  removeService(index: number) {
    this.diagSelectedServices.splice(index, 1);
  }

  addPart(id: string) {
    this.diagSelectedParts.push({ id, price: this.getPartPrice(id) });
  }

  removePart(index: number) {
    this.diagSelectedParts.splice(index, 1);
  }

  getPartName(id: string): string {
    const p = this.partsList.find(x => x._id === id);
    return p ? p.name : '';
  }

  getPartPrice(id: string): number {
    const p = this.partsList.find(x => x._id === id);
    return p ? p.price : 0;
  }

  getFaultName(id: string): string {
    const f = this.faultsList.find(x => x._id === id);
    return f ? f.name : '';
  }

  getServiceName(id: string): string {
    const s = this.servicesList.find(x => x._id === id);
    return s ? s.name : '';
  }

  getServicePrice(id: string): number {
    const s = this.servicesList.find(x => x._id === id);
    return s ? s.price : 0;
  }

  openPopup(item: RepairItem): void {
    this.popupItem = item;

    // Clear state initially
    this.diagDescription = '';
    this.diagSelectedFaults = [];
    this.diagSelectedServices = [];
    this.diagSelectedParts = [];

    if (['oczekiwanie na kosztorys', 'oczekiwanie na zatwierdzenie kosztorysu', 'w trakcie naprawy', 'zakończone'].includes(item.status)) {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      this.http.get<any>(`http://localhost:3000/api/mechanic/visits/${item._id}/diagnosis`, { headers })
        .subscribe(res => {
          if (res) {
            this.diagDescription = res.diagnosisDescription || '';
            this.diagSelectedFaults = res.faults || [];
            this.diagSelectedServices = (res.requiredServices || []).map((s: any) => ({ id: s.serviceId, price: s.price }));
            this.diagSelectedParts = (res.requiredParts || []).map((p: any) => ({ id: p.partId, price: p.price }));
          }
        });
    }
  }

  closePopup(): void {
    if (this.popupItem && this.popupItem.status === 'oczekiwanie na kosztorys') {
      // Auto-save when exiting popup window
      const payload = {
        diagnosisDescription: this.diagDescription,
        faults: this.diagSelectedFaults,
        requiredServices: this.diagSelectedServices.map(s => ({ serviceId: s.id, price: s.price })),
        requiredParts: this.diagSelectedParts.map(p => ({ partId: p.id, price: p.price }))
      };
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      this.http.put(`http://localhost:3000/api/visits/${this.popupItem._id}/diagnosis`, payload, { headers })
        .subscribe({
          next: () => this.popupItem = null,
          error: () => this.popupItem = null
        });
    } else {
      this.popupItem = null;
    }
  }

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.fetchVisits();
    this.fetchDictionaries();
  }

  fetchDictionaries() {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    this.http.get<Fault[]>('http://localhost:3000/api/faults', { headers }).subscribe(res => this.faultsList = res);
    this.http.get<Service[]>('http://localhost:3000/api/services', { headers }).subscribe(res => this.servicesList = res);
    this.http.get<Part[]>('http://localhost:3000/api/parts', { headers }).subscribe(res => this.partsList = res);
  }

  // Status order for the main flow
  readonly STATUS_ORDER = [
    'nadchodzące',
    'oczekiwanie na kosztorys',
    'oczekiwanie na zatwierdzenie kosztorysu',
    'w trakcie naprawy',
    'zakończone',
  ];

  getNextStatus(currentStatus: string): string | null {
    const idx = this.STATUS_ORDER.indexOf(currentStatus);
    if (idx >= 0 && idx < this.STATUS_ORDER.length - 1) {
      return this.STATUS_ORDER[idx + 1];
    }
    return null;
  }

  changeStatus(item: RepairItem, newStatus: string): void {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    if (item.status === 'oczekiwanie na kosztorys' && newStatus === 'oczekiwanie na zatwierdzenie kosztorysu') {
      // Save diagnosis first
      const payload = {
        diagnosisDescription: this.diagDescription,
        faults: this.diagSelectedFaults,
        requiredServices: this.diagSelectedServices.map(s => ({ serviceId: s.id, price: s.price })),
        requiredParts: this.diagSelectedParts.map(p => ({ partId: p.id, price: p.price }))
      };
      this.http.put(`http://localhost:3000/api/visits/${item._id}/diagnosis`, payload, { headers })
        .subscribe({
          next: () => this.updateVisitStatus(item._id, newStatus, headers),
          error: (err) => console.error('Błąd zapisu kosztorysu', err)
        });
    } else {
      this.updateVisitStatus(item._id, newStatus, headers);
    }
  }

  openCancelConfirmation(): void {
    this.cancelConfirmationOpen = true;
  }

  closeCancelConfirmation(): void {
    this.cancelConfirmationOpen = false;
  }

  confirmCancel(): void {
    if (this.popupItem) {
      this.changeStatus(this.popupItem, 'anulowane');
      this.cancelConfirmationOpen = false;
    }
  }

  private updateVisitStatus(visitId: string, newStatus: string, headers: any): void {
    this.http.patch(`http://localhost:3000/api/visits/${visitId}/status`, { status: newStatus }, { headers })
      .subscribe({
        next: () => {
          this.fetchVisits();
          this.closePopup();
        },
        error: (err) => {
          console.error('Błąd zmiany statusu', err);
        }
      });
  }

  fetchVisits() {
    const token = localStorage.getItem('token');
    this.http.get<any[]>('http://localhost:3000/api/visits', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).subscribe({
      next: (data) => {
        // Bucket by status
        const buckets: Record<string, RepairItem[]> = {};
        for (const s of this.STATUS_ORDER) buckets[s] = [];
        const anulowane: RepairItem[] = [];

        data.forEach(v => {
          const item: RepairItem = {
            _id: v._id,
            date: v.date,
            time: v.time,
            service: v.serviceName,
            client: v.clientName,
            status: v.status ?? '',
            description: v.description ?? '',
            vehicle: v.vehicle
          };

          const statusLower = (v.status ?? '').toLowerCase().trim();
          if (statusLower === 'anulowane' || statusLower === 'anulowana') {
            anulowane.push(item);
          } else if (buckets[v.status] !== undefined) {
            buckets[v.status].push(item);
          } else {
            // Fallback: put in nadchodzące
            buckets['nadchodzące'].push(item);
          }
        });

        this.sections = [
          ...this.STATUS_ORDER.map((name) => ({
            name,
            expanded: false,
            items: this.sortByDateTime(buckets[name])
          })),
          { name: 'anulowane', expanded: false, items: this.sortByDateTime(anulowane) },
        ];
      },
      error: (err) => {
        console.error('Błąd pobierania wizyt', err);
      }
    });
  }

  sortByDateTime(items: RepairItem[]): RepairItem[] {
    return items.slice().sort((a, b) => {
      const da = `${a.date} ${a.time ?? ''}`;
      const db = `${b.date} ${b.time ?? ''}`;
      return da.localeCompare(db);
    });
  }

  openDeleteConfirmation(section: RepairSection, item: RepairItem): void {
    this.pendingDeleteSection = section;
    this.pendingDeleteItem = item;
    this.deleteConfirmationOpen = true;
  }

  cancelDelete(): void {
    this.deleteConfirmationOpen = false;
    this.pendingDeleteItem = null;
    this.pendingDeleteSection = null;
  }

  confirmDelete(): void {
    if (!this.pendingDeleteItem || !this.pendingDeleteSection) return;
    const item = this.pendingDeleteItem;
    const section = this.pendingDeleteSection;
    const token = localStorage.getItem('token');
    this.http.delete(`http://localhost:3000/api/visits/${item._id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: () => {
        section.items = section.items.filter(i => i._id !== item._id);
        this.cancelDelete();
      },
      error: (err) => {
        console.error('Błąd usuwania wizyty', err);
        this.cancelDelete();
      }
    });
  }

  deleteItem(section: RepairSection, item: RepairItem): void {
    this.openDeleteConfirmation(section, item);
  }

  toggleSection(section: RepairSection): void {
    section.expanded = !section.expanded;
  }

  filteredItems(items: RepairItem[]): RepairItem[] {
    if (!this.filterText.trim()) {
      return items;
    }
    const query = this.filterText.toLowerCase();
    return items.filter(
      (item) =>
        item.date.toLowerCase().includes(query) ||
        item.time.toLowerCase().includes(query) ||
        item.service.toLowerCase().includes(query) ||
        item.client.toLowerCase().includes(query)
    );
  }
}
