import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleVisit } from './schedule-visit';

describe('ScheduleVisit', () => {
  let component: ScheduleVisit;
  let fixture: ComponentFixture<ScheduleVisit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleVisit],
    }).compileComponents();

    fixture = TestBed.createComponent(ScheduleVisit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
