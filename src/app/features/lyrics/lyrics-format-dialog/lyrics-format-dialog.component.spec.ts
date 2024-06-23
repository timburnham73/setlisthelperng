import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LyricsFormatDialogComponent } from './lyrics-format-dialog.component';

describe('LyricsFormatDialogComponent', () => {
  let component: LyricsFormatDialogComponent;
  let fixture: ComponentFixture<LyricsFormatDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LyricsFormatDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LyricsFormatDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
