import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaveBackground } from './wave-background';

describe('WaveBackground', () => {
  let component: WaveBackground;
  let fixture: ComponentFixture<WaveBackground>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaveBackground],
    }).compileComponents();

    fixture = TestBed.createComponent(WaveBackground);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
