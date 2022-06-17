import { TestBed } from '@angular/core/testing';

import { NgxDropzoneService } from './ngx-dropzone.service';

describe('NgxDropzoneService', () => {
  let service: NgxDropzoneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxDropzoneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
