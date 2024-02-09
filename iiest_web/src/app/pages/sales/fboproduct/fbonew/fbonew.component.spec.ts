import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FbonewComponent } from './fbonew.component';

describe('FbonewComponent', () => {
  let component: FbonewComponent;
  let fixture: ComponentFixture<FbonewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FbonewComponent]
    });
    fixture = TestBed.createComponent(FbonewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
