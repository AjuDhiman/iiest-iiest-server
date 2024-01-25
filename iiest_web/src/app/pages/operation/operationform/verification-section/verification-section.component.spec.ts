import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerificationSectionComponent } from './verification-section.component';

describe('VerificationSectionComponent', () => {
  let component: VerificationSectionComponent;
  let fixture: ComponentFixture<VerificationSectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VerificationSectionComponent]
    });
    fixture = TestBed.createComponent(VerificationSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
