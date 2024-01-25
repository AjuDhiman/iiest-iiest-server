import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrollmentSectionComponent } from './enrollment-section.component';

describe('EnrollmentSectionComponent', () => {
  let component: EnrollmentSectionComponent;
  let fixture: ComponentFixture<EnrollmentSectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EnrollmentSectionComponent]
    });
    fixture = TestBed.createComponent(EnrollmentSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
