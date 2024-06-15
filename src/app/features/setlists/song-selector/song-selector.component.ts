import { Component, Inject } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { UserHelper } from 'functions/src/model/user';
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
  imports: [MatCard,MatCardContent, MatIcon],
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

  onCheckSong(song: Song){

  }
  
  onAdd(){

  }

  search(search: string){
    this.filteredSongs = this.allSongs.filter((song) => song.name.toLowerCase().includes(search));
  }
}
