import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFboComponent } from './view-fbo.component';

describe('ViewFboComponent', () => {
  let component: ViewFboComponent;
  let fixture: ComponentFixture<ViewFboComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewFboComponent]
    });
    fixture = TestBed.createComponent(ViewFboComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
