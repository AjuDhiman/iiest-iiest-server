import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConformationModalComponent } from './conformation-modal.component';

describe('ConformationModalComponent', () => {
  let component: ConformationModalComponent;
  let fixture: ComponentFixture<ConformationModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConformationModalComponent]
    });
    fixture = TestBed.createComponent(ConformationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
