import { TestBed } from '@angular/core/testing';

import { SetlistSongService } from './setlist-songs.service';

describe('SetlistSongsService', () => {
  let service: SetlistSongService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SetlistSongService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
