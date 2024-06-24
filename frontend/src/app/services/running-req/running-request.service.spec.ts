import { TestBed } from '@angular/core/testing';

import { RunningRequestService } from './running-request.service';

describe('RunningRequestService', () => {
  let service: RunningRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RunningRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
