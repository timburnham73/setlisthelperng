import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource as MatTableDataSource, MatTableModule } from '@angular/material/table';
import { NGXLogger } from 'ngx-logger';
import { Title } from '@angular/platform-browser';
import { NotificationService } from 'src/app/core/services/notification.service';
import { SongService } from 'src/app/core/services/song.service';
import { SAMPLE_SONGS } from 'src/app/core/model/sampleSongs';
import { Observable, finalize, first } from 'rxjs';
import { Song } from 'src/app/core/model/song';
import { ActivatedRoute, Router } from '@angular/router';
import { SongEditDialogComponent } from '../song-edit-dialog/song-edit-dialog.component';
import { SongEdit } from 'src/app/core/model/account-song';
import { Select, Store } from '@ngxs/store';
import { AccountActions, AccountState } from 'src/app/core/store/account.state';
import { Account } from 'src/app/core/model/account';
import { LyricAddDialogComponent } from '../../lyrics/lyric-add-dialog/lyric-add-dialog.component';
import { AccountLyric, Lyric } from 'src/app/core/model/lyric';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgFor, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import {
  MatDialog,
  MatDialogRef,
  MatDialogActions,
  MatDialogClose,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import { CONFIRM_DIALOG_RESULT, ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { SetlistRef } from 'functions/src/model/setlist';
import { FlexLayoutModule, FlexModule } from 'ngx-flexible-layout';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
    selector: 'app-song-list',
    templateUrl: './song-list.component.html',
    styleUrls: ['./song-list.component.css'],
    standalone: true,
    imports: [MatCardModule, 
      MatToolbarModule, 
      MatButtonModule, 
      MatIconModule, 
      FormsModule, 
      MatFormFieldModule, 
      MatInputModule, 
      NgIf, 
      NgFor,
      MatProgressSpinnerModule, 
      MatTableModule, 
      MatSortModule,
      MatSidenav,
      FlexModule,
      FlexLayoutModule]
})
export class SongListComponent implements OnInit {
  @Select(AccountState.selectedAccount) 
  selectedAccount$!: Observable<Account>;
  currentUser: any;
  displayedColumns: string[] = [ 'name', 'artist', 'genre', 'key', 'tempo', 'timeSignature', 'songLength', 'lyrics', 'setlists', 'remove'];
  allSongs : Song[];
  filteredSongs : Song[];
  accountId: string;
  showRemove = false;
  @ViewChild(MatSort, { static: true })
  sort: MatSort = new MatSort;
  loading = false;
  lastPageLoaded = 0;

  constructor(
    private logger: NGXLogger,
    private route: ActivatedRoute,
    private titleService: Title,
    private songService: SongService,
    private store: Store,
    private authService: AuthenticationService,
    private router: Router,
    public dialog: MatDialog

  ) { 
    this.authService.user$.subscribe((user) => {
      if(user && user.uid){
        this.currentUser = user;
      }
    });
    const selectedAccount = this.store.selectSnapshot(AccountState.selectedAccount);
    const id = this.route.snapshot.paramMap.get('accountid');
    if(id){
      this.loading = false;
      this.accountId = id;
      this.songService.getSongs(this.accountId)
        .pipe(
          finalize(() => this.loading = false)
        )
        .subscribe((songs) => {
          this.allSongs = this.filteredSongs = songs;
        });
    }
  }

  ngOnInit() {
    this.titleService.setTitle('Songs');
    
    //this.dataSource.sort = this.sort;
  }

  search(search: string){
    this.filteredSongs = this.allSongs.filter((song) => song.name.toLowerCase().includes(search));
  }

  sortChange(sortState: Sort) {
    // if (sortState.direction) {
    //   this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    // } else {
    //   this._liveAnnouncer.announce('Sorting cleared');
    // }
  }

  loadMore(){
    this.lastPageLoaded++;
    this.loading = true;
    this.songService.getSongs(this.accountId, "asc", this.lastPageLoaded)
        .pipe(
          finalize(() => this.loading = false)
        )
        .subscribe((songs) => {
          this.allSongs =  this.allSongs.concat(songs);
        });
  }

  onAddSong(){
    const dialogRef = this.dialog.open(SongEditDialogComponent, {
      data: { accountId: this.accountId, song: null},
      panelClass: "dialog-responsive",
    });
  }

  onAddMultipleSongs(){
    this.router.navigate([`addmultiple`], { relativeTo: this.route });
  }

  onEditSong(row: any){
    const dialogRef = this.dialog.open(SongEditDialogComponent, {
      data: { accountId: this.accountId, song: row},
      panelClass: "dialog-responsive",
    })
    .afterClosed().subscribe((data) => {
    });
  }

  onEnableDeleteMode() {
    this.showRemove = !this.showRemove;
  }

  onRemoveSong(event, songToDelete: Song) {
    event.preventDefault();
    let message = "Are you sure you want to delete this song?";
    let message2 = "";
    let hasSetlists = false;
    if(songToDelete.setlists && songToDelete.setlists.length > 0){
      hasSetlists = true;
      const setlistNames = songToDelete.setlists.map((setlistRef) => setlistRef.name).join(', ');
      message = `This song is contained in the following setlists ${setlistNames}.`
      message2 = `This song can not be deleted. Do you want to deactivate the song?`
    }

    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title: "Delete", message: message, message2, okButtonText: "Yes", cancelButtonText: "Cancel"},
      panelClass: "dialog-responsive",
      width: '300px',
      enterAnimationDuration: '200ms', 
      exitAnimationDuration: '200ms',
      
    })
    .afterClosed().subscribe((data) => {
      if(data && data.result === CONFIRM_DIALOG_RESULT.OK){
        if(!hasSetlists){
          this.songService
              .removeSong(songToDelete, this.accountId!, this.currentUser)
              .pipe(first())
              .subscribe();
        }
        else{
          //TODO: deactivate
          songToDelete.deactivated = true;
           this.songService.updateSong(this.accountId!, songToDelete?.id!, songToDelete, this.currentUser);
        }
      }
    });
    
  }

  onViewLyrics(event, row: any){
    event.preventDefault();
    this.router.navigate([row.id + `/lyrics`], { relativeTo: this.route });
  }

  onViewSetlists(event, row: any){
    event.preventDefault();
    this.router.navigate([`setlists`], { relativeTo: this.route });
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

  getSetlistCount(song){
    if(song && song.setlists && song.setlists.length > 0){
      return song.setlists.length;
    }
    return 0;
  }

  getSetlistNames(song){
    if(song && song.setlists && song.setlists.length > 0){
      return song.setlists.map((setlist: SetlistRef) => setlist.name).join(', ');
    }
    return 0;
  }
}
