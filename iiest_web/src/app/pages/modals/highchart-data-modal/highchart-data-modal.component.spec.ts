import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HighchartDataModalComponent } from './highchart-data-modal.component';

describe('HighchartDataModalComponent', () => {
  let component: HighchartDataModalComponent;
  let fixture: ComponentFixture<HighchartDataModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HighchartDataModalComponent]
    });
    fixture = TestBed.createComponent(HighchartDataModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
