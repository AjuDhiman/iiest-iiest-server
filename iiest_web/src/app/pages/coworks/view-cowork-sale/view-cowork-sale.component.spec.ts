import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCoworkSaleComponent } from './view-cowork-sale.component';

describe('ViewCoworkSaleComponent', () => {
  let component: ViewCoworkSaleComponent;
  let fixture: ComponentFixture<ViewCoworkSaleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewCoworkSaleComponent]
    });
    fixture = TestBed.createComponent(ViewCoworkSaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
