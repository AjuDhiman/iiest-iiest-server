import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatListsComponent } from './stat-lists.component';

describe('StatListsComponent', () => {
  let component: StatListsComponent;
  let fixture: ComponentFixture<StatListsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StatListsComponent]
    });
    fixture = TestBed.createComponent(StatListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
