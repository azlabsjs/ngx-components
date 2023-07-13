import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxFormControlComponent } from './ngx-form-control.component';

describe('NgxFormControlComponent', () => {
  let component: NgxFormControlComponent;
  let fixture: ComponentFixture<NgxFormControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgxFormControlComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxFormControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
