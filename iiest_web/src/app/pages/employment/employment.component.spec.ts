import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaallocationComponent } from './areaallocation.component';

describe('AreaallocationComponent', () => {
  let component: AreaallocationComponent;
  let fixture: ComponentFixture<AreaallocationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AreaallocationComponent]
    });
    fixture = TestBed.createComponent(AreaallocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
