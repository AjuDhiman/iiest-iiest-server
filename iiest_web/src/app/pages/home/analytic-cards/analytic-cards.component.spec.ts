import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticCardsComponent } from './analytic-cards.component';

describe('AnalyticCardsComponent', () => {
  let component: AnalyticCardsComponent;
  let fixture: ComponentFixture<AnalyticCardsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AnalyticCardsComponent]
    });
    fixture = TestBed.createComponent(AnalyticCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
