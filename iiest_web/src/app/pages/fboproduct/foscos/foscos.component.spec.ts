import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoscosComponent } from './foscos.component';

describe('FoscosComponent', () => {
  let component: FoscosComponent;
  let fixture: ComponentFixture<FoscosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FoscosComponent]
    });
    fixture = TestBed.createComponent(FoscosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
