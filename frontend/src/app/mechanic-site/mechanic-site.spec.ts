import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MechanicSite } from './mechanic-site';

describe('MechanicSite', () => {
  let component: MechanicSite;
  let fixture: ComponentFixture<MechanicSite>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MechanicSite],
    }).compileComponents();

    fixture = TestBed.createComponent(MechanicSite);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
