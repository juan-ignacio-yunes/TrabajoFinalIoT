import { TestBed } from '@angular/core/testing';

import { POSTsService } from './posts.service';

describe('POSTsService', () => {
  let service: POSTsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(POSTsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
