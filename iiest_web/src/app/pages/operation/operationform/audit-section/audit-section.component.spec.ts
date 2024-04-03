import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditSectionComponent } from './audit-section.component';

describe('AuditSectionComponent', () => {
  let component: AuditSectionComponent;
  let fixture: ComponentFixture<AuditSectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AuditSectionComponent]
    });
    fixture = TestBed.createComponent(AuditSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
