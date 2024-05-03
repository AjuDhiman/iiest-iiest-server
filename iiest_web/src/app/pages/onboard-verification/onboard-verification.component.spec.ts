import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardVerificationComponent } from './onboard-verification.component';

describe('OnboardVerificationComponent', () => {
  let component: OnboardVerificationComponent;
  let fixture: ComponentFixture<OnboardVerificationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OnboardVerificationComponent]
    });
    fixture = TestBed.createComponent(OnboardVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
