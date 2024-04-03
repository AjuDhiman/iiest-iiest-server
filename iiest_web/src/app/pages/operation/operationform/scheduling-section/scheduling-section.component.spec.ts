import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulingSectionComponent } from './scheduling-section.component';

describe('SchedulingSectionComponent', () => {
  let component: SchedulingSectionComponent;
  let fixture: ComponentFixture<SchedulingSectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SchedulingSectionComponent]
    });
    fixture = TestBed.createComponent(SchedulingSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
