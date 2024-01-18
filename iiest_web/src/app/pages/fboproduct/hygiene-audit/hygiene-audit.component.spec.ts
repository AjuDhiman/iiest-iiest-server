import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HygieneAuditComponent } from './hygiene-audit.component';

describe('HygieneAuditComponent', () => {
  let component: HygieneAuditComponent;
  let fixture: ComponentFixture<HygieneAuditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HygieneAuditComponent]
    });
    fixture = TestBed.createComponent(HygieneAuditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
