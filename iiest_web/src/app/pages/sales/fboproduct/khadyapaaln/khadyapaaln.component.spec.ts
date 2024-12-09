import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KhadyapaalnComponent } from './khadyapaaln.component';

describe('KhadyapaalnComponent', () => {
  let component: KhadyapaalnComponent;
  let fixture: ComponentFixture<KhadyapaalnComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [KhadyapaalnComponent]
    });
    fixture = TestBed.createComponent(KhadyapaalnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
