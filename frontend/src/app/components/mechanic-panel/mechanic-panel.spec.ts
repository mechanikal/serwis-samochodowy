import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MechanicPanel } from './mechanic-panel';

describe('MechanicPanel', () => {
  let component: MechanicPanel;
  let fixture: ComponentFixture<MechanicPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MechanicPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(MechanicPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
