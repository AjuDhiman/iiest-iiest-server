import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovesaleModalComponent } from './approvesale-modal.component';

describe('ApprovesaleModalComponent', () => {
  let component: ApprovesaleModalComponent;
  let fixture: ComponentFixture<ApprovesaleModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ApprovesaleModalComponent]
    });
    fixture = TestBed.createComponent(ApprovesaleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
