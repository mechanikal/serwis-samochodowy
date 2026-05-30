import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientCars } from './client-cars';

describe('ClientCars', () => {
  let component: ClientCars;
  let fixture: ComponentFixture<ClientCars>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientCars],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientCars);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
