import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopsModalComponent } from './shops-modal.component';

describe('ShopsModalComponent', () => {
  let component: ShopsModalComponent;
  let fixture: ComponentFixture<ShopsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShopsModalComponent]
    });
    fixture = TestBed.createComponent(ShopsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
