import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentationModalComponent } from './documentation-modal.component';

describe('DocumentationModalComponent', () => {
  let component: DocumentationModalComponent;
  let fixture: ComponentFixture<DocumentationModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DocumentationModalComponent]
    });
    fixture = TestBed.createComponent(DocumentationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
