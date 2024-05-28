import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LyricsRoutingModule } from './lyrics-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { LyricsComponent } from './lyrics-view/lyrics.component';
import { LyricsEditComponent } from './lyrics-edit/lyrics-edit.component';
import { LyricAddDialogComponent } from './lyric-add-dialog/lyric-add-dialog.component';
import { SafeHtml } from 'src/app/shared/pipes/safe-html.pipe';

@NgModule({
    imports: [
        CommonModule,
        LyricsRoutingModule,
        SharedModule,
        LyricsComponent,
        LyricsEditComponent,
        LyricAddDialogComponent,
        SafeHtml
    ]
})
export class LyricsModule { }
