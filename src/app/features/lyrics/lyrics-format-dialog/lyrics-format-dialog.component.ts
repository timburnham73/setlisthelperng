import { NgxMatDatetimePickerModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import { NgFor, NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatOption } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenu, MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelect } from '@angular/material/select';
import { FormatScope } from 'src/app/core/model/lyric';
import { LyricFormat, LyricFormatWithScope, fontSizes, fonts, lyricParts } from 'src/app/core/model/lyric-format';
import { LyricsService } from 'src/app/core/services/lyrics.service';

@Component({
  selector: 'app-lyrics-format-dialog',
  standalone: true,
  imports: [
    FormsModule, 
    NgxMatDatetimePickerModule,
    NgxMatMomentModule,
    NgxMatTimepickerModule, 
    ReactiveFormsModule, 
    MatDialogModule, 
    NgIf, 
    NgFor,
    MatMenu,
    MatOption,
    MatSelect,
    MatButtonToggle,
    MatButtonToggleGroup,
    MatMenuModule,
    MatIconModule,
    MatFormFieldModule, 
    MatInputModule, 
    MatDatepickerModule, 
    MatButtonModule, 
    MatIconModule, 
    MatProgressSpinnerModule],
  templateUrl: './lyrics-format-dialog.component.html',
  styleUrl: './lyrics-format-dialog.component.scss'
})
export class LyricsFormatDialogComponent {

  selectedFontStyle: string[] = [];
  selectedFont: string = "Arial";
  fonts = fonts;

  selectedLyricPart: string = "lyric";
  lyricParts = lyricParts;
  
  selectedFontSize: string = "medium";
  fontSizes = fontSizes;

  lyricFormat: LyricFormat;
  formatScope: FormatScope;
  FormatScopeType = FormatScope;

  constructor(
    public dialogRef: MatDialogRef<LyricsFormatDialogComponent>,
    private lyricService: LyricsService,
    @Inject(MAT_DIALOG_DATA) public data: LyricFormatWithScope,
  ) {
    
    this.formatScope = data.formatScope;
    this.lyricFormat = data.lyricFormat;
    
    this.onChangeFormatScope();
  }

  private onChangeFormatScope() {
    
    this.selectedFont = this.lyricFormat.font;
    this.updateControlsFromLyricFormat();
  }

  onSave(){
    const lyricFormatwithScope = {
      formatScope: this.formatScope,
      lyricFormat: this.lyricFormat
    } as LyricFormatWithScope;

    this.dialogRef.close(lyricFormatwithScope);
  }
  
  onNoClick(): void {
    this.dialogRef.close();
  }

  //When the lyric part changes in the dropdown this function will up date the state of the toolbar.
  private updateControlsFromLyricFormat() {
    const selectedLyricPart = this.lyricFormat.lyricPartFormat.find(lyricPart => lyricPart.lyricPart === this.selectedLyricPart);
    const newSelectedForntStyle: string[] = [];
    if (selectedLyricPart) {
      if(selectedLyricPart.isBold){
        newSelectedForntStyle.push('bold');
      }
      if(selectedLyricPart.isItalic){
        newSelectedForntStyle.push('italic');
      }
      if(selectedLyricPart.isUnderlined){
        newSelectedForntStyle.push('underline');
      }
      //Setting bold, italic, and/or underline
      this.selectedFontStyle = newSelectedForntStyle;
      //Font size for the lyric part. 
      this.selectedFontSize = selectedLyricPart.fontSize;
    }
    
    //Global font name
    this.selectedFont = this.lyricFormat.font;
  }

  onSelectLyricPart(fontname: string) {
    this.updateControlsFromLyricFormat();
  }

  onSelectFormatScope(formatScope: FormatScope){
    this.formatScope = formatScope;
  }

  onSelectFont(fontname: string) {
    this.lyricFormat.font = fontname;
  }
  
  //Bold, Italic, or Underline
  onFormatToggleStyle(selectedFontStyle){
    const lyricPart = this.lyricFormat.lyricPartFormat.find(lyricPart => this.selectedLyricPart === lyricPart.lyricPart);
    if(lyricPart){
      lyricPart.isBold = selectedFontStyle.find(fontStyle => fontStyle === "bold") ? true : false;
      lyricPart.isItalic = selectedFontStyle.find(fontStyle => fontStyle === "italic") ? true : false;
      lyricPart.isUnderlined = selectedFontStyle.find(fontStyle => fontStyle === "underline") ? true : false;
    }
  }

  onSelectFontSize(fontSize: string) {
    const lyricPart = this.lyricFormat.lyricPartFormat.find(lyricPart => this.selectedLyricPart === lyricPart.lyricPart);
    if(lyricPart){
      lyricPart.fontSize = fontSize;
    }
  }
}
