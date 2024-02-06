import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FbolistprodwiseComponent } from './fbolistprodwise.component';

describe('FbolistprodwiseComponent', () => {
  let component: FbolistprodwiseComponent;
  let fixture: ComponentFixture<FbolistprodwiseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FbolistprodwiseComponent]
    });
    fixture = TestBed.createComponent(FbolistprodwiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
