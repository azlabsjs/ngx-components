import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxDropzoneComponent } from './ngx-dropzone.component';

describe('NgxDropzoneComponent', () => {
  let component: NgxDropzoneComponent;
  let fixture: ComponentFixture<NgxDropzoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgxDropzoneComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxDropzoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
