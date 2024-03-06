import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipientListComponent } from './recipient-list.component';

describe('RecipientListComponent', () => {
  let component: RecipientListComponent;
  let fixture: ComponentFixture<RecipientListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RecipientListComponent]
    });
    fixture = TestBed.createComponent(RecipientListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
