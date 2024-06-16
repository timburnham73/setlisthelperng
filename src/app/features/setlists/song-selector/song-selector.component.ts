import { NgFor, NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { UserHelper } from 'functions/src/model/user';
import { FlexLayoutModule, FlexModule } from 'ngx-flexible-layout';
import { AccountSetlistSongSelector } from 'src/app/core/model/account-setlist-song-selector';
import { Song } from 'src/app/core/model/song';
import { User } from 'src/app/core/model/user';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { SetlistSongService } from 'src/app/core/services/setlist-songs.service';
import { SongService } from 'src/app/core/services/song.service';
import { AccountState } from 'src/app/core/store/account.state';

@Component({
  selector: 'app-song-selector',
  standalone: true,
  imports: [
    MatCard,
    MatCardContent,
    MatIcon,
    FlexLayoutModule,
    MatCardModule,
    NgFor,
    FlexModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    NgIf,
    NgFor,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatDivider,
    MatProgressSpinnerModule],
  templateUrl: './song-selector.component.html',
  styleUrl: './song-selector.component.scss'
})
export class SongSelectorComponent {
  currentUser: User;
  accountId: string;
  setlistId: string;
  allSongs: Song[];
  filteredSongs: Song[];
  setlistSongIds: string[];
  checkedSongIds: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<SongSelectorComponent>,
    public songService: SongService,
    private setlistSongsService: SetlistSongService,
    private store: Store,
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    @Inject(MAT_DIALOG_DATA) public data: AccountSetlistSongSelector,
  ) {

    this.authService.user$.subscribe((user) => {
      if (user && user.uid) {
        this.currentUser = UserHelper.getForUpdate(user);
      }
    });

    const selectedAccount = this.store.selectSnapshot(
      AccountState.selectedAccount
    );
    this.accountId = this.data.accountId;
    this.setlistId = this.data.setlistId;

    //Get the songs for the song picker
    this.songService.getSongs(this.accountId).subscribe((songs) => {
      this.allSongs = this.filteredSongs = songs;
    });

    //Get the setlist songs
    if (this.setlistId) {
      this.setlistSongsService
        .getOrderedSetlistSongs(this.accountId, this.setlistId)
        .subscribe((setlistSongs) => {
          this.setlistSongIds = setlistSongs.map(setlistSong => setlistSong.songId);
        });
    }
  }

  shouldShowcheck(song){
    if(song.id){
      return this.checkedSongIds.find(songId => songId === song.id);
    }
    return false;
  }
  onCheckSong(song: Song) {
    if(song.id){
      const index = this.checkedSongIds.findIndex(songId => songId === song.id);
      if(index > -1){
        this.checkedSongIds.splice(index, 1);
      }
      else{
        this.checkedSongIds.push(song.id);
      }
    }
  }

  onAdd() {

  }

  search(search: string) {
    this.filteredSongs = this.allSongs.filter((song) => song.name.toLowerCase().includes(search));
  }
}
