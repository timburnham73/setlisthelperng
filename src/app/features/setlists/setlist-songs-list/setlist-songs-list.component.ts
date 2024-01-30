import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { MatDialog as MatDialog } from '@angular/material/dialog';
import { MatTableDataSource as MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { NGXLogger } from 'ngx-logger';
import { Observable, concat, first } from 'rxjs';
import { Account } from 'src/app/core/model/account';
import { SetlistSong } from 'src/app/core/model/setlist-song';
import { Song } from 'src/app/core/model/song';
import { BaseUser, UserHelper } from 'src/app/core/model/user';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { SetlistSongsService } from 'src/app/core/services/setlist-songs.service';
import { SetlistService } from 'src/app/core/services/setlist.service';
import { SongService } from 'src/app/core/services/song.service';
import { AccountState } from 'src/app/core/store/account.state';
import { LyricAddDialogComponent } from '../../lyrics/lyric-add-dialog/lyric-add-dialog.component';
import { Lyric } from 'src/app/core/model/lyric';
import { NgIf, NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from 'ngx-flexible-layout';
import {CdkDragDrop, DragDropModule} from '@angular/cdk/drag-drop';
import { drop } from 'lodash-es';

@Component({
    selector: 'app-setlist-songs-list',
    templateUrl: './setlist-songs-list.component.html',
    styleUrls: ['./setlist-songs-list.component.scss'],
    standalone: true,
    imports: [FlexLayoutModule, MatCardModule, MatToolbarModule, FormsModule, MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatButtonModule, MatIconModule, NgIf, NgClass, DragDropModule]
})
export class SetlistSongsListComponent {
  @Select(AccountState.selectedAccount) 
  selectedAccount$!: Observable<Account>;
  currentUser: BaseUser;
  displayedSongColumns: string[] = [ 'name', 'artist'];
  displayedColumns: string[] = [ 'sequence','name', 'artist', 'genre', 'key', 'tempo', 'timeSignature', 'songLength', 'lyrics'];
  dsSetlistSongs =  new MatTableDataSource<SetlistSong>();
  dsSongs = new MatTableDataSource<Song>();
  accountId?: string;
  setlistId?: string;
  setlistSongCount: number;

  displaySequence = 1;
  //Used for numbering the rows to skip the
  setlistBreakCount = 0;

  //Use to select the row.
  selectedRowSequence = -1;
  
  
  constructor(private logger: NGXLogger,
    private route: ActivatedRoute,
    private titleService: Title,
    private setlistSongsService: SetlistSongsService,
    private songService: SongService,
    private store: Store,
    private authService: AuthenticationService,
    private router: Router,
    public dialog: MatDialog) {

    this.authService.user$.subscribe((user) => {
      if (user && user.uid) {
        this.currentUser = UserHelper.getForUpdate(user);
      }
    });

    const selectedAccount = this.store.selectSnapshot(AccountState.selectedAccount);
    const accountId = this.route.snapshot.paramMap.get('accountid');
    const setlistId = this.route.snapshot.paramMap.get('setlistid');
    if(accountId && setlistId){
      this.accountId = accountId;

      //Get the songs for the song picker
      this.songService.getSongs(this.accountId).subscribe((songs) => {
        this.dsSongs =  new MatTableDataSource(songs);
      });

      //Get the setlist songs
      if(setlistId){
        this.setlistId = setlistId;
        this.setlistSongsService.getSetlistSongs(this.accountId, this.setlistId).subscribe((setlistSongs) => {
          this.dsSetlistSongs =  new MatTableDataSource(setlistSongs);
          this.setlistSongCount = this.dsSetlistSongs.filteredData.length;
        });
      }
    }
   }

   //Events ////////////////
   //Adds a song after the selected row. If no row is selected
  onAddSetlistSong(row: Song, sequenceNumberToInsert?: Number): void {
    const sequenceNumber = this.getSequenceNumberForAddOrUpdate();
    const setlistSong = {displaySequenceNumber: sequenceNumber, sequenceNumber: sequenceNumber, songId: row.id!, isBreak: false, ...row};
    this.setlistSongsService.addSetlistSong(this.accountId!, this.setlistId!, setlistSong, this.currentUser)
  }

  onAddBreak(){
    const sequenceNumber = this.getSequenceNumberForAddOrUpdate();
    const setlistSong = {sequenceNumber: sequenceNumber, songId: '', isBreak: true, name: 'Break'};
    this.setlistSongsService.addSetlistBreak(this.accountId!, this.setlistId!, setlistSong)
  }

  onEditSong(row): void{

  }

  onViewLyrics(event, row: any){
    event.preventDefault();
    this.router.navigate([`${row.songId}/lyrics`], {relativeTo: this.route});
  }

  onAddLyric(event, row: Song){
    event.preventDefault();
    const accountLyric = { accountId: this.accountId, songId: row.id, createdByUserId: this.currentUser.uid };
    const dialogRef = this.dialog.open(LyricAddDialogComponent, {
      data: {accountLyric: accountLyric, countOfLyrics: 0},
      panelClass: "dialog-responsive",
    });

    dialogRef.afterClosed().subscribe((result: Lyric) => {
      if(result){
        this.router.navigate([row.id + `/lyrics/${result.id}/edit`], { relativeTo: this.route });
      }
    });
  }

  onListDrop(event: CdkDragDrop<SetlistSong[]>){
    const droppedSetlistSong = event.item.data as SetlistSong;
    const sequenceNumberToInsert = event.currentIndex;
    
    if(event.previousIndex > event.currentIndex){
      const subscription = this.setlistSongsService.insertSetlistSong(droppedSetlistSong, sequenceNumberToInsert + 1, this.accountId!, this.setlistId!, this.currentUser)
                              .pipe(first())
                              .subscribe()
      
    }
    
    
  }

  //TODO: remove this function if I don't use it. 
  //Helper functions
  //setlistSongToMove is the SetlistSong to move
  //sequenceNumberToInsert is a 1 based sequence not 0
  moveSetlistSongUpTo(setlistSongToMove: SetlistSong, sequenceNumberToInsert: number): void {
    const setlistSongToDisplace = this.dsSetlistSongs.data[sequenceNumberToInsert - 1];
    const setlistSongToInsert = {...setlistSongToMove, songId: setlistSongToMove.id! };

    if(setlistSongToDisplace?.sequenceNumber){
      //first increment the sequence of the song that is displaced.
      setlistSongToDisplace.sequenceNumber += .01;
      //Set the sequence number for the song to insert
      setlistSongToInsert.sequenceNumber = setlistSongToDisplace.sequenceNumber - .01;
      
      concat( 
        //Update the displaced song
        this.setlistSongsService.updateSetlistSong(setlistSongToDisplace?.id!, this.accountId!, this.setlistId!, setlistSongToDisplace, this.currentUser),
        //Update the song to insert
        this.setlistSongsService.updateSetlistSong(setlistSongToInsert.id!, this.accountId!, this.setlistId!, setlistSongToInsert, this.currentUser)
      );
    }
  }

  getSequenceNumber(rowIndex: number){
    if(rowIndex === 0){
      this.setlistBreakCount = 0;
    }
    
    if(this.setlistBreakCount > 0){
      this.displaySequence = rowIndex - this.setlistBreakCount;
    }
    else{
      this.displaySequence = rowIndex;
    }

    return this.displaySequence + 1;
  }

  incrementSetBreakCount(){
    this.setlistBreakCount += 1;
    return '';
  }

  selectRow(row){
    if(this.selectedRowSequence === -1 || this.selectedRowSequence !== row.sequenceNumber){
      this.selectedRowSequence = row.sequenceNumber;
    }
    else{
      this.selectedRowSequence = -1;
    }
  }

  private getSequenceNumberForAddOrUpdate() {
    let sequenceNumber = this.setlistSongCount + 1;
    if (this.selectedRowSequence !== -1) {
      sequenceNumber = this.selectedRowSequence + 0.01;
    }
    return sequenceNumber;
  }
}
