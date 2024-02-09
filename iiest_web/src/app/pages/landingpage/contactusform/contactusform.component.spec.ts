import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactusformComponent } from './contactusform.component';

describe('ContactusformComponent', () => {
  let component: ContactusformComponent;
  let fixture: ComponentFixture<ContactusformComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ContactusformComponent]
    });
    fixture = TestBed.createComponent(ContactusformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
