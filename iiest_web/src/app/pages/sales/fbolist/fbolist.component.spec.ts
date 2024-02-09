import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FbolistComponent } from './fbolist.component';

describe('FbolistComponent', () => {
  let component: FbolistComponent;
  let fixture: ComponentFixture<FbolistComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FbolistComponent]
    });
    fixture = TestBed.createComponent(FbolistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
