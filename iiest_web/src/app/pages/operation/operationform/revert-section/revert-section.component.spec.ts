import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevertSectionComponent } from './revert-section.component';

describe('RevertSectionComponent', () => {
  let component: RevertSectionComponent;
  let fixture: ComponentFixture<RevertSectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RevertSectionComponent]
    });
    fixture = TestBed.createComponent(RevertSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
