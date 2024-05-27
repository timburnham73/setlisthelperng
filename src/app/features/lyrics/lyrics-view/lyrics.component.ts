import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild, ViewEncapsulation } from "@angular/core";
import { MatTableDataSource as MatTableDataSource } from "@angular/material/table";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { Store } from "@ngxs/store";
import { AccountLyric, Lyric } from "src/app/core/model/lyric";
import { LyricsService } from "src/app/core/services/lyrics.service";
import { SongService } from "src/app/core/services/song.service";
import { AccountState } from "src/app/core/store/account.state";
import { LyricAddDialogComponent } from "../lyric-add-dialog/lyric-add-dialog.component";
import { MatDialog as MatDialog } from "@angular/material/dialog";
import { Song } from "src/app/core/model/song";
import { take } from "rxjs";
import { FormControl } from "@angular/forms";
import { AuthenticationService } from "src/app/core/services/auth.service";
import { MatOptionModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { NgIf, NgFor } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatCardModule } from "@angular/material/card";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import ChordSheetJS, { HtmlTableFormatter } from 'chordsheetjs';
import { parse } from "path";
import { LyricFormat, LyricFormatHelper, fontSizes, fonts, lyricParts } from "src/app/core/model/lyric-format";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { ChordProParser } from "src/app/core/services/ChordProParser";

@Component({
    selector: "app-lyrics",
    templateUrl: "./lyrics.component.html",
    styleUrls: ["./lyrics.component.scss"],
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    imports: [
        MatCardModule,
        MatToolbarModule,
        MatProgressSpinnerModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatIconModule,
        NgIf,
        MatFormFieldModule,
        MatSelectModule,
        NgFor,
        MatOptionModule
    ],
})
export class LyricsComponent implements AfterViewInit {
  @ViewChild('lyricSection') lyricSection;
  @ViewChild('toggleFontStyle') toggleFontStyle;
  
  accountId?: string;
  songId?: string;
  lyricId?: string;
  setlistId?: string;
  song?: Song;
  selectedLyric?: Lyric;
  parsedLyric?: string;
  
  selectedFontStyle: string[] = [];
  selectedFont: string = "Courier New";
  fonts = fonts;

  selectedLyricPart: string = "chord";
  lyricParts = lyricParts;
  

  selectedFontSize: string = "medium";
  fontSizes = fontSizes;

  lyricFormat: LyricFormat;
  defaultLyricId: string | undefined;
  isDefaultLyric = false;
  
  
  lyricVersionValue = "add";
  lyrics: Lyric[];
  lyricVersions = new FormControl("");
  currentUser: any;
  loading = false;

  isTransposing = false;
  isFormatting = false;


  constructor(
    private activeRoute: ActivatedRoute,
    private titleService: Title,
    private lyricsService: LyricsService,
    private songService: SongService,
    private store: Store,
    private router: Router,
    public dialog: MatDialog,
    private authService: AuthenticationService,
    private renderer: Renderer2
  ) {
    const selectedAccount = this.store.selectSnapshot(
      AccountState.selectedAccount
    );

    this.authService.user$.subscribe((user) => {
      if (user && user.uid) {
        this.currentUser = user;
      }
    });

    //The version can change on the page. This will subscribe to the page change event
    //Normally navigating to the same component is not supported. 
    //I added the onSameUrlNavigation: 'reload' on the router config.
    activeRoute.params.subscribe(val => {
      this.initLyrics();
    });
  }

  ngAfterViewInit(){
    setTimeout(() => {
      this.updateToolbarFromLyricFont();
      
      this.updateFormat();
    }, 100);
  }

  private initLyrics() {
    this.loading = true;
    const accountId = this.activeRoute.snapshot.paramMap.get("accountid");
    const songId = this.activeRoute.snapshot.paramMap.get("songid");
    this.lyricId = this.activeRoute.snapshot.paramMap.get("lyricid") || undefined;
    this.setlistId = this.activeRoute.snapshot.paramMap.get("setlistid") || undefined;
    if (accountId && songId) {
      this.accountId = accountId;
      this.songId = songId;
      this.songService
        .getSong(this.accountId, this.songId)
        .pipe(take(1))
        .subscribe((song) => {
          this.song = song;
          this.defaultLyricId = this.getDefaultLyricId(); 
        });

      this.lyricsService
        .getSongLyrics(this.accountId, this.songId)
        .pipe(take(1))
        .subscribe((lyrics) => {
          this.lyrics = lyrics;
          
          this.lyricFormat = LyricFormatHelper.getDefaultFormat();
          this.selectedLyric = this.getSelectedLyric(lyrics);
          this.isDefaultLyric = this.isDefaultLyricSelected();
          if(this.selectedLyric){
              const parser =  new ChordProParser(this.selectedLyric?.lyrics!, this.selectedLyric?.transpose!);
              this.parsedLyric = parser.parseChordPro();
          }
          
          this.loading = false;
          this.lyricVersionValue = this.selectedLyric?.id || "add";
        });
    }
  }

  private getDefaultLyricId(){
    if (this.song?.defaultLyricForUser) {
      return this.song?.defaultLyricForUser.find((userLyric) => userLyric.uid === this.currentUser.uid)?.lyricId;
    }
    return undefined;
  }

  private isDefaultLyricSelected(){    
      return this.defaultLyricId === this.selectedLyric?.id;
  }
  
  private getSelectedLyric(lyrics: any) {
    //If the lyric id is NOT passed in on the url 
    if (!this.lyricId) {
      if (this.song?.defaultLyricForUser) {
        const userLyric = this.song?.defaultLyricForUser.find((userLyric) => userLyric.uid === this.currentUser.uid);
        if (userLyric) {
          const selecteLyric = lyrics.find((lyric) => lyric.id === userLyric.lyricId);
          return selecteLyric ? selecteLyric : lyrics[0];
        }
      }
    } else {
      //If the lyric is not passed in with the URL find the default lyrics or first lyric.
      const selectedLyric = lyrics.find((lyric) => lyric.id === this.lyricId);
      return selectedLyric ? selectedLyric : lyrics[0];
    }
    return lyrics[0];
  }

  onFormatLyrics(){
    this.isFormatting = !this.isFormatting;
  }

  onTranspose(){
    this.isTransposing = !this.isTransposing;
  }
  
  onTransposeLyric(transposeDown: boolean){
    if(this.selectedLyric){
      let transposeNumber = this.selectedLyric!.transpose
      if(!transposeNumber){
        transposeNumber = 0;
      }
      if(transposeDown){
        transposeNumber += -1;
      }
      else{
        transposeNumber += 1;
      }

      this.selectedLyric!.transpose = transposeNumber;
      this.lyricsService.updateLyric(this.accountId!, this.songId!, this.selectedLyric, this.currentUser);
      
      const parser =  new ChordProParser(this.selectedLyric?.lyrics!, transposeNumber);
      this.parsedLyric = parser.parseChordPro();
    
      setTimeout(() => {
        this.updateFormat();
      }, 100);
      
    }
  }

  onAddLyric(event?) {
    event?.preventDefault();
    const accountLyric = {
      accountId: this.accountId,
      songId: this.songId,
      createdByUserId: this.currentUser.uid,
    };
    const dialogRef = this.dialog.open(LyricAddDialogComponent, {
      data: { accountLyric: accountLyric, countOfLyrics: this.lyrics.length },
      panelClass: "dialog-responsive",
    });

    dialogRef.afterClosed().subscribe((result: Lyric) => {
      if (result) {
        this.selectedLyric = result;
        this.onEditLyric();
      }{
        this.lyricVersionValue = this.selectedLyric?.id || "add";
      }
    });
  }

  onEditLyric() {
    if(this.lyricId){
        this.router.navigate([`../${this.selectedLyric?.id}/edit`], {
          relativeTo: this.activeRoute,
        });
      }
      else{
        this.router.navigate([`${this.selectedLyric?.id}/edit`], {
          relativeTo: this.activeRoute,
        });
      }
    
  }

  onSetDefaultUser(event: Event){
    this.songService.setDefaultLyricForUser(this.accountId!, this.songId!, this.song!, this.selectedLyric?.id!, this.currentUser).subscribe(
      () => {
        this.isDefaultLyric = true;
        this.defaultLyricId = this.selectedLyric?.id;
      }
    );
  }

  onSelectFont(fontname: string) {
    this.lyricFormat.font = fontname;
    this.updateFormat();
  }
  
  onSelectLyricPart(fontname: string) {
    this.updateToolbarFromLyricFont();
  }

  //Bold, Italic, or Underline
  onFormatToggleStyle(selectedFontStyle){
    console.log(selectedFontStyle);
    const lyricPart = this.lyricFormat.lyricPartFormat.find(lyricPart => this.selectedLyricPart === lyricPart.lyricPart);
    if(lyricPart){
      lyricPart.isBold = selectedFontStyle.find(fontStyle => fontStyle === "bold") ? true : false;
      lyricPart.isItalic = selectedFontStyle.find(fontStyle => fontStyle === "italic") ? true : false;
      lyricPart.isUnderlined = selectedFontStyle.find(fontStyle => fontStyle === "underline") ? true : false;
    }
    this.updateFormat();
  }

  onFormatLyricPart(lyricPart: string, formatItem: string, value: string | boolean){
    this.updateFormat();
  }

  onSelectFontSize(fontSize: string) {
    const lyricPart = this.lyricFormat.lyricPartFormat.find(lyricPart => this.selectedLyricPart === lyricPart.lyricPart);
    if(lyricPart){
      lyricPart.fontSize = fontSize;
    }
    this.updateFormat();
  }

  //All lyric parts set the html for them here.
  updateFormat(){
    
    const titlePart = this.lyricFormat.lyricPartFormat.find(lyricPart => lyricPart.lyricPart === "title");
    const titleElements = this.lyricSection.nativeElement.getElementsByClassName('title')
    this.formatLyricPart(titleElements, titlePart);

    const subTitlePart = this.lyricFormat.lyricPartFormat.find(lyricPart => lyricPart.lyricPart === "subtitle");
    const subTitleElements = this.lyricSection.nativeElement.getElementsByClassName('subtitle')
    this.formatLyricPart(subTitleElements, subTitlePart);
    
    const chordPart = this.lyricFormat.lyricPartFormat.find(lyricPart => lyricPart.lyricPart === "chord");
    const chordElements = this.lyricSection.nativeElement.getElementsByClassName("chord");
    this.formatLyricPart(chordElements, chordPart);

    const lyricPart = this.lyricFormat.lyricPartFormat.find(lyricPart => lyricPart.lyricPart === "lyric");
    const lyricElements = this.lyricSection.nativeElement.getElementsByClassName("lyric");
    this.formatLyricPart(lyricElements, lyricPart);

    const commentPart = this.lyricFormat.lyricPartFormat.find(lyricPart => lyricPart.lyricPart === "comment");
    const commentElements = this.lyricSection.nativeElement.getElementsByClassName("comment");
    this.formatLyricPart(commentElements, commentPart);

    const songPart = this.lyricFormat.lyricPartFormat.find(lyricPart => lyricPart.lyricPart === "song-part");
    const songPartElements = this.lyricSection.nativeElement.getElementsByClassName("song-part");
    this.formatLyricPart(songPartElements, songPart);
  }

  //Updates a lyric part html styles (lyrics, chords, title, ...) 
  formatLyricPart(elements, lyricPart){
    for(const element of elements){
      const innerText = element.innerText;
      if(innerText){
        element.style.fontWeight = lyricPart?.isBold ? 'bold' : 'normal' ;
        element.style.fontStyle = lyricPart?.isItalic ? 'italic' : '' ;
        element.style.textDecoration = lyricPart?.isUnderlined ? 'underline' : '' ;
        element.style.fontSize = lyricPart?.fontSize;
      }
    }
  }

  //When the lyric part changes in the dropdown this function will up date the state of the toolbar.
  private updateToolbarFromLyricFont() {
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

  onSelectLyric(value: string) {
    if (value === "add") {
      this.onAddLyric();
    } else {
      //Switch to another lyrics. If there is no lyric id the route is different. 
      //You may get here without a lyric id when selecting from the song list.
      if(this.lyricId){
        this.router.navigate([`../${value}`], {
          relativeTo: this.activeRoute,
        });
      }
      else{
        //Switch to another lyrics
        this.router.navigate([`../lyrics/${value}`], {
          relativeTo: this.activeRoute,
        });
      }
    }
  }

  onBackToSong() {
    if(this.lyricId){
    this.router.navigate(["../../.."], { relativeTo: this.activeRoute });
    }
    else{
      this.router.navigate(["../.."], { relativeTo: this.activeRoute });
    }
  }
}
