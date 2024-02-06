import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceSectionComponent } from './attendance-section.component';

describe('AttendanceSectionComponent', () => {
  let component: AttendanceSectionComponent;
  let fixture: ComponentFixture<AttendanceSectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AttendanceSectionComponent]
    });
    fixture = TestBed.createComponent(AttendanceSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
