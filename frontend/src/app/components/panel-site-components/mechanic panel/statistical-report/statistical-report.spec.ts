import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticalReport } from './statistical-report';

describe('StatisticalReport', () => {
  let component: StatisticalReport;
  let fixture: ComponentFixture<StatisticalReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatisticalReport],
    }).compileComponents();

    fixture = TestBed.createComponent(StatisticalReport);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
