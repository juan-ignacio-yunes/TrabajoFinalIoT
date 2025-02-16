import { TestBed } from '@angular/core/testing';

import { GetLogService } from './get-log.service';

describe('GetLogService', () => {
  let service: GetLogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetLogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
