import { TestBed } from '@angular/core/testing';

import { GetMedicionService } from './get-medicion.service';

describe('GetMedicionService', () => {
  let service: GetMedicionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetMedicionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
