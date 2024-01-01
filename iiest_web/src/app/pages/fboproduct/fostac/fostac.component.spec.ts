import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FostacComponent } from './fostac.component';

describe('FostacComponent', () => {
  let component: FostacComponent;
  let fixture: ComponentFixture<FostacComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FostacComponent]
    });
    fixture = TestBed.createComponent(FostacComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
