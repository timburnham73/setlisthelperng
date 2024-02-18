import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef as MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { catchError, concat, first, tap, throwError } from 'rxjs';
import { SongEdit } from 'src/app/core/model/account-song';
import { Song } from 'src/app/core/model/song';
import { BaseUser, UserHelper } from 'src/app/core/model/user';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { SongService } from 'src/app/core/services/song.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgIf } from '@angular/common';
import { SetlistSong, SetlistSongHelper } from 'src/app/core/model/setlist-song';
import { SetlistSongsService } from 'src/app/core/services/setlist-songs.service';
import { MatDivider } from '@angular/material/divider';

@Component({
    selector: 'app-song-edit-dialog',
    templateUrl: './song-edit-dialog.component.html',
    styleUrls: ['./song-edit-dialog.component.css'],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, MatDialogModule, NgIf, MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule, MatCheckboxModule, MatButtonModule, MatIconModule,MatDivider, MatProgressSpinnerModule]
})
export class SongEditDialogComponent {
  currentUser: BaseUser;
  saving = false;
  isNew = true;
  song: Song | SetlistSong | undefined;
  accountId: string | undefined;
  setlistId: string | undefined;
  songForm: FormGroup;
  get name() { return this.songForm.get('name'); }

  constructor(
    public dialogRef: MatDialogRef<SongEditDialogComponent>,
    private songService: SongService,
    private setlistSongService: SetlistSongsService,
    private authService: AuthenticationService,
    @Inject(MAT_DIALOG_DATA) public data: SongEdit,
  ) { 
    
    if(this.data && Object.keys(this.data.song).length){
      this.song = this.data.song;
      this.isNew = false;
    }

    this.accountId = this.data.accountId;
    this.setlistId = this.data.setlistId;

    this.authService.user$.subscribe((user) => {
      if (user && user.uid) {
        this.currentUser = UserHelper.getForUpdate(user);
      }
    });

    this.songForm = new FormGroup({
      name: new FormControl(this.song?.name || '', Validators.required),
      artist: new FormControl(this.song?.artist || ''),
      genre: new FormControl(this.song?.genre || ''),
      key: new FormControl(this.song?.key || 'C'),
      tempo: new FormControl(this.song?.tempo || 120, [Validators.min(0), Validators.max(400)] ),
      lengthMin: new FormControl(this.song?.lengthMin || 3, [Validators.min(0), Validators.max(59)] ),
      lengthSec: new FormControl(this.song?.lengthSec || 0, [Validators.min(0), Validators.max(59)] ),
      beatValue: new FormControl(this.song?.beatValue || 4, [Validators.min(1), Validators.max(12)] ),
      noteValue: new FormControl(this.song?.noteValue || 4, [Validators.min(1), Validators.max(12)] ),
      notes: new FormControl(this.song?.notes || ''),
      other: new FormControl(this.song?.other || ''),
      saveSourceSong: new FormControl((this.song as SetlistSong)?.saveChangesToRepertoire || true),
      deactivated: new FormControl(this.song?.deactivated || false),
    });
  }

  onNoClick(): void {
    this.dialogRef.close()
  }

  onSave(): void {
    this.saving = true;
    
    if(this.song?.id){
      if((this.song as SetlistSong)?.sequenceNumber && this.setlistId){
        const updateSetlistSong$ = this.updateSetlistSong();
        const observableArr: any[] = [updateSetlistSong$];
        if((this.song as SetlistSong)?.saveChangesToRepertoire){
          const updateSong$ = this.updateSong();
          observableArr.push(updateSong$);
        }
        concat(observableArr)
            .pipe(first(),tap((result) => this.dialogRef.close()),)
            .subscribe();
      }
      else{
        this.updateSong()
            .pipe(first())
            .subscribe();
      }
    } else{
      if((this.song as SetlistSong)?.sequenceNumber){
        this.addSong()
            .pipe(first())
            .subscribe();
      }
      else{
        this.addSetlistSong()
          .pipe(first())
          .subscribe();
      }
    }
  }

  updateSetlistSong(){
    const modifiedSong = {...this.song, ...this.songForm.value} as SetlistSong;
    return this.setlistSongService.updateSetlistSong(this.song?.id!, this.accountId!, this.setlistId!, modifiedSong, this.currentUser)
      .pipe(
        tap((result) => this.dialogRef.close(modifiedSong)),
        catchError((err) => {
          console.log(err);
          alert('Could not update song');
          return throwError(() => new Error(err));
        })
      );
  }

  updateSong(){
    let modifiedSong = {...this.song, ...this.songForm.value} as Song;
    const setlistSong = modifiedSong as SetlistSong;
    if(setlistSong?.sequenceNumber && this.setlistId){
      modifiedSong = SetlistSongHelper.getSongFromSetlistSong(modifiedSong as SetlistSong); 
    }
    return this.songService.updateSong(this.accountId!, modifiedSong?.id!, modifiedSong, this.currentUser)
      .pipe(
        tap((result) => this.dialogRef.close(modifiedSong)),
        catchError((err) => {
          console.log(err);
          alert('Could not update song');
          return throwError(() => new Error(err));
        })
      );
  }

  addSetlistSong(){
    const modifiedSong = {...this.song, ...this.songForm.value} as SetlistSong;
    return this.setlistSongService.addSetlistSong(modifiedSong, this.accountId!, this.setlistId!, this.currentUser)
    .pipe(
      tap((result) => this.dialogRef.close(modifiedSong)),
      catchError((err) => {
        console.log(err);
        alert('Could not add song.');
        return throwError(() => new Error(err));
      })
    ); 
  }

  addSong(){
    const modifiedSong = {...this.song, ...this.songForm.value} as Song;
    return this.songService.addSong(this.accountId!, modifiedSong, this.currentUser)
    .pipe(
      tap((result) => this.dialogRef.close(modifiedSong)),
      catchError((err) => {
        console.log(err);
        alert('Could not add song.');
        return throwError(() => new Error(err));
      })
    ); 
  }
  
  //If the song is a Setlist song then show the checkbox
  showChangesToRepertoire(){
    if((this.song as SetlistSong)?.sequenceNumber){
      return true;
    }
    return false;
  }
}
