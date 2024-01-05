import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FboComponent } from './fbo.component';

describe('FboComponent', () => {
  let component: FboComponent;
  let fixture: ComponentFixture<FboComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FboComponent]
    });
    fixture = TestBed.createComponent(FboComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
