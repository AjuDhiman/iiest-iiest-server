import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodlabelingComponent } from './foodlabeling.component';

describe('FoodlabelingComponent', () => {
  let component: FoodlabelingComponent;
  let fixture: ComponentFixture<FoodlabelingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FoodlabelingComponent]
    });
    fixture = TestBed.createComponent(FoodlabelingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
