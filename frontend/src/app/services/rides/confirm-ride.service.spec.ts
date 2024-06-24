import { TestBed } from '@angular/core/testing';

import { ConfirmRideService } from './confirm-ride.service';

describe('ConfirmRideService', () => {
  let service: ConfirmRideService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfirmRideService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
