import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxAzlFormComponent } from './ngx-azl-form.component';

describe('NgxAzlFormComponent', () => {
  let component: NgxAzlFormComponent;
  let fixture: ComponentFixture<NgxAzlFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgxAzlFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxAzlFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
