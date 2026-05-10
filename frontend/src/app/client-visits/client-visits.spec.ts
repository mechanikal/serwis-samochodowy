import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientVisits } from './client-visits';

describe('ClientVisits', () => {
  let component: ClientVisits;
  let fixture: ComponentFixture<ClientVisits>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientVisits],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientVisits);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
