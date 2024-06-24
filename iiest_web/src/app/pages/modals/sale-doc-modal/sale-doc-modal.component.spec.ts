import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleDocModalComponent } from './sale-doc-modal.component';

describe('SaleDocModalComponent', () => {
  let component: SaleDocModalComponent;
  let fixture: ComponentFixture<SaleDocModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SaleDocModalComponent]
    });
    fixture = TestBed.createComponent(SaleDocModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
