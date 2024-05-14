import { SelectionModel } from "@angular/cdk/collections";
import { Component, OnInit } from "@angular/core";
import { MatDialog as MatDialog } from "@angular/material/dialog";
import {
  MatTableDataSource as MatTableDataSource,
  MatTableModule,
} from "@angular/material/table";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { Select, Store } from "@ngxs/store";
import { NGXLogger } from "ngx-logger";
import { Observable, concat, first } from "rxjs";
import { Account } from "src/app/core/model/account";
import { SetlistSong } from "src/app/core/model/setlist-song";
import { Song } from "src/app/core/model/song";
import { BaseUser, UserHelper } from "src/app/core/model/user";
import { AuthenticationService } from "src/app/core/services/auth.service";
import { SetlistSongService } from "src/app/core/services/setlist-songs.service";
import { SetlistService } from "src/app/core/services/setlist.service";
import { SongService } from "src/app/core/services/song.service";
import { AccountState } from "src/app/core/store/account.state";
import { LyricAddDialogComponent } from "../../lyrics/lyric-add-dialog/lyric-add-dialog.component";
import { Lyric } from "src/app/core/model/lyric";
import { NgIf, NgClass, DatePipe } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatSortModule } from "@angular/material/sort";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FormsModule } from "@angular/forms";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatCardModule } from "@angular/material/card";
import { FlexLayoutModule } from "ngx-flexible-layout";
import { CdkDragDrop, DragDropModule } from "@angular/cdk/drag-drop";
import { drop } from "lodash-es";
import { SongEditDialogComponent } from "../../songs/song-edit-dialog/song-edit-dialog.component";
import { SongEdit } from "src/app/core/model/account-song";
import { MatMenuModule } from "@angular/material/menu";
import { MatDivider } from "@angular/material/divider";
import { Setlist } from "src/app/core/model/setlist";
import { SetlistBreak } from "functions/src/model/setlist-break";

@Component({
  selector: "app-setlist-songs-list",
  templateUrl: "./setlist-songs-list.component.html",
  styleUrls: ["./setlist-songs-list.component.scss"],
  standalone: true,
  imports: [
    FlexLayoutModule,
    MatCardModule,
    MatToolbarModule,
    MatDivider,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    DatePipe,
    NgIf,
    NgClass,
    DragDropModule,
    SongEditDialogComponent
  ],
})
export class SetlistSongsListComponent {
  @Select(AccountState.selectedAccount)
  selectedAccount$!: Observable<Account>;
  currentUser: BaseUser;
  displayedSongColumns: string[] = ["name", "artist"];
  displayedColumns: string[] = [
    "sequence",
    "name",
    "artist",
    "genre",
    "key",
    "tempo",
    "timeSignature",
    "songLength",
    "lyrics",
    "remove"
  ];
  dsSetlistSongs = new MatTableDataSource<SetlistSong>();
  filteredSongs: Song[];
  allSongs: Song[];
  accountId?: string;
  setlist?: Setlist;
  setlistSongCount: number;

  showRemove = false;

  displaySequence = 1;
  //Used for numbering the rows to skip the
  setlistBreakCount = 0;

  //Use to select the row.
  selectedRowSequence = -1;

  constructor(
    private logger: NGXLogger,
    private route: ActivatedRoute,
    private titleService: Title,
    private setlistSongsService: SetlistSongService,
    private setlistService: SetlistService,
    private songService: SongService,
    private store: Store,
    private authService: AuthenticationService,
    private router: Router,
    public dialog: MatDialog
  ) {
    this.authService.user$.subscribe((user) => {
      if (user && user.uid) {
        this.currentUser = UserHelper.getForUpdate(user);
      }
    });

    const selectedAccount = this.store.selectSnapshot(
      AccountState.selectedAccount
    );
    const accountId = this.route.snapshot.paramMap.get("accountid");
    const setlistId = this.route.snapshot.paramMap.get("setlistid");
    if (accountId && setlistId) {
      this.accountId = accountId;

      //Get the songs for the song picker
      this.songService.getSongs(this.accountId).subscribe((songs) => {
        this.allSongs = this.filteredSongs = songs;
      });

      //Get the setlist songs
      if (setlistId) {
        this.setlistService
          .getSetlist(this.accountId, setlistId)
          .subscribe((setlist) => this.setlist = setlist);

        this.setlistSongsService
          .getOrderedSetlistSongs(this.accountId, setlistId)
          .subscribe((setlistSongs) => {
            this.dsSetlistSongs = new MatTableDataSource(setlistSongs);
            this.setlistSongCount = this.dsSetlistSongs.filteredData.length;
          });
      }
    }
  }

  search(search: string){
    this.filteredSongs = this.allSongs.filter((song) => song.name.toLowerCase().includes(search));
  }
  
  //Events ////////////////
  //Adds a song after the selected row. If no row is selected
  onAddSetlistSong(row: Song, sequenceNumberToInsert?: number): void {
    const sequenceNumber = sequenceNumberToInsert !== undefined ? sequenceNumberToInsert! : this.getSequenceNumberForAddOrUpdate();
    const setlistSong = {
      sequenceNumber: sequenceNumber,
      songId: row.id!,
      isBreak: false,
      saveChangesToRepertoire: true,
      ...row,
    };

    if(this.setlist && this.setlist.id){
      this.setlistSongsService.addSetlistSong(
        setlistSong,
        this.accountId!,
        this.setlist,
        this.currentUser
        )
        .pipe(first())
        .subscribe();
    }
  }

  onAddSong() {
    const sequenceNumber = this.getSequenceNumberForAddOrUpdate();
    const partialSong = { sequenceNumber: sequenceNumber, isBreak: false, saveChangesToRepertoire: true } as SetlistSong;
    if(this.setlist && this.setlist.id && this.accountId){
      const dialogRef = this.dialog.open(SongEditDialogComponent, {
        data: { accountId: this.accountId, setlistId: this.setlist.id, song: partialSong },
        panelClass: "dialog-responsive",
      });
    }
  }

  onAddBreak() {
    const sequenceNumber = this.getSequenceNumberForAddOrUpdate();
    const setlistSong = {
      sequenceNumber: sequenceNumber,
      songId: "",
      isBreak: true,
      name: "Break",
      lengthMin: 10,
      lengthSec: 0 
    };
    if(this.setlist && this.setlist.id && this.accountId){
      this.setlistSongsService.addSetlistBreak(
        this.accountId,
        this.setlist,
        setlistSong,
        this.currentUser,
      )
        .pipe(first())
        .subscribe();
    }
  }

  onPrintSetlist() {

  }

  onEnableDeleteMode() {
    this.showRemove = !this.showRemove;
  }

  onEditSong(row): void {
    if(this.setlist && this.setlist.id){
      const dialogRef = this.dialog.open(SongEditDialogComponent, {
        data: { accountId: this.accountId, setlistId: this.setlist.id, song: row } as SongEdit,
        panelClass: "dialog-responsive",
      });
    }

  }

  onRemoveSong(event, element) {
    event.preventDefault();
    
    if(this.setlist && this.setlist.id){
      this.setlistSongsService
        .removeSetlistSong(element, this.accountId!, this.setlist, this.currentUser)
        .pipe(first())
        .subscribe();
    }
  }

  onViewLyrics(event, row: any) {
    event.preventDefault();
    this.router.navigate([`${row.songId}/lyrics`], { relativeTo: this.route });
  }

  onAddLyric(event, row: Song) {
    event.preventDefault();
    const accountLyric = {
      accountId: this.accountId,
      songId: row.id,
      createdByUserId: this.currentUser.uid,
    };
    const dialogRef = this.dialog.open(LyricAddDialogComponent, {
      data: { accountLyric: accountLyric, countOfLyrics: 0 },
      panelClass: "dialog-responsive",
    });

    dialogRef.afterClosed().subscribe((result: Lyric) => {
      if (result) {
        this.router.navigate([row.id + `/lyrics/${result.id}/edit`], {
          relativeTo: this.route,
        });
      }
    });
  }

  onListDrop(event: CdkDragDrop<Song[] | SetlistSong[]>) {
    const sequenceNumberToInsert = event.currentIndex;
    if (!event.item.data.sequenceNumber) {
      //Add from the song list
      this.onAddSetlistSong(event.item.data, sequenceNumberToInsert);
    }
    else {
      //Move around the setlist song list.
      const droppedSetlistSong = event.item.data as SetlistSong;
      if (event.previousIndex > event.currentIndex) {
        const countOfSongsToReorder = event.previousIndex - event.currentIndex;
        //User has moved the song up in the setlist
        if(this.setlist && this.setlist.id){
          this.setlistSongsService
            .moveSetlistSong(
              droppedSetlistSong,
              sequenceNumberToInsert + 1,
              this.accountId!,
              this.setlist.id,
              this.currentUser,
              true
            )
            .pipe(first())
            .subscribe();
        }
      }
      else {
        const songsToReorder = event.currentIndex - event.previousIndex;
        //Moved down in the setlist.
        if(this.setlist && this.setlist.id){
          this.setlistSongsService
            .moveSetlistSong(
              droppedSetlistSong,
              sequenceNumberToInsert + 1,
              this.accountId!,
              this.setlist.id,
              this.currentUser,
              false
            )
            .pipe(first())
            .subscribe();
        }
      }
    }
  }

  getSequenceNumber(rowIndex: number) {
    //Reset the break count with the first row.
    if (rowIndex === 0) {
      this.setlistBreakCount = 0;
    }

    if (this.setlistBreakCount > 0) {
      this.displaySequence = rowIndex - this.setlistBreakCount;
    } else {
      this.displaySequence = rowIndex;
    }

    return this.displaySequence + 1;
  }

  incrementSetBreakCount(rowIndex: number) {
    //Reset the break count with the first row.
    if (rowIndex === 0) {
      this.setlistBreakCount = 0;
    }
    this.setlistBreakCount += 1;
    return "";
  }

  selectRow(row) {
    if (
      this.selectedRowSequence === -1 ||
      this.selectedRowSequence !== row.sequenceNumber
    ) {
      this.selectedRowSequence = row.sequenceNumber;
    } else {
      this.selectedRowSequence = -1;
    }
  }

  //If there is not a selected song add it at the end.
  private getSequenceNumberForAddOrUpdate() {
    let sequenceNumber = this.setlistSongCount + 1;
    if (this.selectedRowSequence !== -1) {
      sequenceNumber = this.selectedRowSequence;
    }
    return sequenceNumber;
  }

  public getSetlistTotalTimeInSeconds(){
    if(this.setlist && this.setlist.totalTimeInSeconds){
      return this.setlist.totalTimeInSeconds;
    }
    return 0;
  }

  public getSetTimeInSeconds(setlistSongBreak: SetlistBreak){
    if(setlistSongBreak){
      return setlistSongBreak.totalTimeInSeconds;
    }
    return 0;
  }
}
