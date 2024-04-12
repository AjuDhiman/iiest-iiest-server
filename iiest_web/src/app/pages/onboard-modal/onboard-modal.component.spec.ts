import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardModalComponent } from './onboard-modal.component';

describe('OnboardModalComponent', () => {
  let component: OnboardModalComponent;
  let fixture: ComponentFixture<OnboardModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OnboardModalComponent]
    });
    fixture = TestBed.createComponent(OnboardModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
