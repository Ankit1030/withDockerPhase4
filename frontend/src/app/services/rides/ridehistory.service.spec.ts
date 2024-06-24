import { TestBed } from '@angular/core/testing';

import { RidehistoryService } from './ridehistory.service';

describe('RidehistoryService', () => {
  let service: RidehistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RidehistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
