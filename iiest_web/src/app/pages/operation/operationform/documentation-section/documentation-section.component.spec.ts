import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentationSectionComponent } from './documentation-section.component';

describe('DocumentationSectionComponent', () => {
  let component: DocumentationSectionComponent;
  let fixture: ComponentFixture<DocumentationSectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DocumentationSectionComponent]
    });
    fixture = TestBed.createComponent(DocumentationSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
