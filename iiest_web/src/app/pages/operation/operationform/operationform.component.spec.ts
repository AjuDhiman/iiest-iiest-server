import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationformComponent } from './operationform.component';

describe('OperationformComponent', () => {
  let component: OperationformComponent;
  let fixture: ComponentFixture<OperationformComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OperationformComponent]
    });
    fixture = TestBed.createComponent(OperationformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
