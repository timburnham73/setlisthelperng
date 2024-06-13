import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SongSelectorComponent } from './song-selector.component';

describe('SongSelectorComponent', () => {
  let component: SongSelectorComponent;
  let fixture: ComponentFixture<SongSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SongSelectorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SongSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
