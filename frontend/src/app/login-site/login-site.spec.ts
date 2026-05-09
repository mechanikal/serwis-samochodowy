import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginSite } from './login-site';

describe('LoginSite', () => {
  let component: LoginSite;
  let fixture: ComponentFixture<LoginSite>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginSite],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginSite);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
