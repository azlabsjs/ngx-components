import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxSlidesComponent } from './ngx-slides.component';

describe('NgxSlidesComponent', () => {
  let component: NgxSlidesComponent;
  let fixture: ComponentFixture<NgxSlidesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgxSlidesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxSlidesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
