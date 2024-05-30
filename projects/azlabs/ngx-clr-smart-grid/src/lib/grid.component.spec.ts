import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxClrSmartGridComponent } from './grid.component';

describe('NgxClrSmartGridComponent', () => {
  let component: NgxClrSmartGridComponent;
  let fixture: ComponentFixture<NgxClrSmartGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgxClrSmartGridComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxClrSmartGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
