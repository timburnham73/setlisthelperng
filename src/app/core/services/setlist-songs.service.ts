import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable, concat, concatMap, from, map } from 'rxjs';
import { Song } from '../model/song';
import { SetlistSong, SetlistSongHelper } from '../model/setlist-song';
import { SetlistBreak, SetlistBreakHelper } from '../model/setlist-break';
import { BaseUser } from '../model/user';
import { convertSnaps } from './db-utils';

@Injectable({
  providedIn: 'root'
})
export class SetlistSongsService {

  constructor(private db: AngularFirestore) {
    
  }

  getSetlistSongs(accountId: string, setlistId: string): Observable<any> {
    const dbPath = `/accounts/${accountId}/setlists/${setlistId}/songs`;
    const songsRef = this.db.collection(dbPath, ref => ref.orderBy("sequenceNumber"));
    return songsRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          {
            const song = c.payload.doc.data() as SetlistSong;
            song.id = c.payload.doc.id;
            return song;
          }
        )
      )
    );
  }

  addSetlistBreak(accountId: string, setlistId: string, setlistSong: SetlistBreak): any {
    const songForAdd = SetlistBreakHelper.getSetlistBreakForAddOrUpdate(setlistSong);
    const dbPath = `/accounts/${accountId}/setlists/${setlistId}/songs`;
    const setlistSongsRef = this.db.collection(dbPath);
    
    return setlistSongsRef.add(songForAdd);
  }

  addSetlistSong(accountId: string, setlistId: string, setlistSong: SetlistSong, editingUser: BaseUser): any {
    const songForAdd = SetlistSongHelper.getForUpdate(setlistSong, editingUser);
    const dbPath = `/accounts/${accountId}/setlists/${setlistId}/songs`;
    const setlistSongsRef = this.db.collection(dbPath);
    
    return setlistSongsRef.add(songForAdd);
  }

  updateSetlistSong(setlistSongId: string,accountId: string, setlistId: string, setlistSong: SetlistSong, editingUser: BaseUser): any {
    const setlisSongForUpdate = SetlistSongHelper.getForUpdate(setlistSong, editingUser);
    const dbPath = `/accounts/${accountId}/setlists/${setlistId}/songs`;
    const setlistSongsRef = this.db.collection(dbPath);
    
    return from(setlistSongsRef.doc(setlistSongId).update(setlisSongForUpdate));
  }

  //Batch commit incrementing the setlist song sequence number.
  insertSetlistSong(setlistSongToInsert, startingSequenceNumber: number, accountId: string, setlistId: string, editingUser: BaseUser): any {
    const dbPath = `/accounts/${accountId}/setlists/${setlistId}/songs`;
    const setlistSongsRef = this.db.collection(dbPath);
    return this.getSetlistSongs(accountId, setlistId)
                    .pipe(
                      concatMap(results => {
                          console.log('insert setlist song')
                          const setlistSongs = results;
                          const batch = this.db.firestore.batch();
                          //Once the starting sequence number is found set this to true so the others can be incremented after.
                          let isUpdating = false;
                          let index = 1;
                          for(const setlistSong of setlistSongs){
                            //Increment the sequence number if the sequenceNumber === startingSequenceNumber or
                            // it is updating.
                            if(index === startingSequenceNumber || (isUpdating && setlistSong.id !== setlistSongToInsert.id)){
                              this.setSetlistSongSequenceNumberForBatch(setlistSong.sequenceNumber += 1, 
                                                                        setlistSongsRef, 
                                                                        setlistSong, 
                                                                        editingUser, 
                                                                        batch);

                              isUpdating = true;
                            }
                            else if(isUpdating && setlistSong.id === setlistSongToInsert.id){
                              this.setSetlistSongSequenceNumberForBatch(setlistSong.sequenceNumber = startingSequenceNumber, 
                                setlistSongsRef, 
                                setlistSong, 
                                editingUser, 
                                batch);
                            }
                            index++;
                          }
                          
                          return from(batch.commit());
                        }
                      )
                    );
  }

  private setSetlistSongSequenceNumberForBatch(sequenceNumber: number, setlistSongsRef: AngularFirestoreCollection<unknown>, setlistSong: SetlistSong, editingUser: BaseUser, batch) {
    const setlistSongRef = setlistSongsRef.doc(setlistSong.id).ref;
    const setlisSongForUpdate = SetlistSongHelper.getForUpdate(setlistSong, editingUser)
    setlisSongForUpdate.sequenceNumber = sequenceNumber;
    setlisSongForUpdate.lastUpdatedByUser = editingUser;
    batch.update(setlistSongRef, setlisSongForUpdate);
  }
}
