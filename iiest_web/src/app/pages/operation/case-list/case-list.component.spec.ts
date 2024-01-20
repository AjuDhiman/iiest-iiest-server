import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseListComponent } from './case-list.component';

describe('CaseListComponent', () => {
  let component: CaseListComponent;
  let fixture: ComponentFixture<CaseListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CaseListComponent]
    });
    fixture = TestBed.createComponent(CaseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
