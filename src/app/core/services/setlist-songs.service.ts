import { Injectable } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from "@angular/fire/compat/firestore";
import { Observable, concat, concatMap, from, map, tap } from "rxjs";
import { Song } from "../model/song";
import { SetlistSong, SetlistSongHelper } from "../model/setlist-song";
import { SetlistBreak, SetlistBreakHelper } from "../model/setlist-break";
import { BaseUser } from "../model/user";
import { convertSnaps } from "./db-utils";
import { DocumentReference, WriteBatch } from "firebase/firestore";

@Injectable({
  providedIn: "root",
})
export class SetlistSongsService {
  constructor(private db: AngularFirestore) {}

  getSetlistSongs(accountId: string, setlistId: string): Observable<any> {
    const dbPath = `/accounts/${accountId}/setlists/${setlistId}/songs`;
    const songsRef = this.db.collection(dbPath, (ref) =>
      ref.orderBy("sequenceNumber")
    );
    return songsRef.snapshotChanges().pipe(
      map((changes) =>
        changes.map((c) => {
          const song = c.payload.doc.data() as SetlistSong;
          song.id = c.payload.doc.id;
          return song;
        })
      )
    );
  }

  addSetlistBreak(
    accountId: string,
    setlistId: string,
    setlistBreak: Partial<SetlistBreak>,
    editingUser: BaseUser
  ): any {
    const breakForAdd =
      SetlistBreakHelper.getSetlistBreakForAddOrUpdate(setlistBreak, editingUser);
    const dbPath = `/accounts/${accountId}/setlists/${setlistId}/songs`;
    const setlistSongsRef = this.db.collection(dbPath);

    return setlistSongsRef.add(breakForAdd);
  }

  addSetlistSong(
    setlistSong: SetlistSong,
    accountId: string,
    setlistId: string,
    editingUser: BaseUser
  ): any {
    const songForAdd = SetlistSongHelper.getForUpdate(setlistSong, editingUser);
    const dbPath = `/accounts/${accountId}/setlists/${setlistId}/songs`;
    const setlistSongsRef = this.db.collection(dbPath);
    
    //return a concat observable with the increment and add combined.
    return this.incrementSequenceOfSongs(songForAdd.sequenceNumber, songForAdd, accountId, setlistId, editingUser);
    
    
    
  }
  //startingSequenceNumber is the currently selected song. All songs after the startingSequence should be incremented. 
  //The new songs sequece should be startingSequenceNumber + 1.
  incrementSequenceOfSongs(startingSequenceNumber: number, songToAdd:SetlistSong, accountId: string, setlistId: string, editingUser: BaseUser){
    const dbPath = `/accounts/${accountId}/setlists/${setlistId}/songs`;
    const setlistSongsRef = this.db.collection(dbPath);
    return this.getSetlistSongs(accountId, setlistId).pipe(
      concatMap((results: SetlistSong[]) => {
        const setlistSongs = results;
        const batch = this.db.firestore.batch();
        setlistSongs.forEach((setlistSong, index) => {
          if(index >= startingSequenceNumber){
            this.setSetlistSongSequenceNumberForBatch(
              (setlistSong.sequenceNumber = setlistSong.sequenceNumber + 1),
              setlistSongsRef,
              setlistSong,
              editingUser,
              batch
            );
          }
        }); 
        //Don't increment if the song is added to the end.
        if(setlistSongs.length === 0){
          songToAdd.sequenceNumber = 1;
        }
        else if(startingSequenceNumber >= setlistSongs.length){
          //Don't incremnet if there are no songs.
          songToAdd.sequenceNumber = setlistSongs.length + 1;
        }
        else{
          songToAdd.sequenceNumber = startingSequenceNumber + 1;
        }
        
        batch.set(setlistSongsRef.doc().ref, songToAdd);
        //Batch commit incrementing the setlist song sequence number.
        return from(batch.commit());
      })
    );           
  }

  updateSetlistSong(
    setlistSongId: string,
    accountId: string,
    setlistId: string,
    setlistSong: SetlistSong,
    editingUser: BaseUser
  ): any {
    const setlisSongForUpdate = SetlistSongHelper.getForUpdate(
      setlistSong,
      editingUser
    );
    const dbPath = `/accounts/${accountId}/setlists/${setlistId}/songs`;
    const setlistSongsRef = this.db.collection(dbPath);

    return from(setlistSongsRef.doc(setlistSongId).update(setlisSongForUpdate));
  }

  //When you move up a setlist songs all songs below need to be reordered.
  moveSetlistSong(
    setlistSongToInsert,
    startingSequenceNumber: number,
    accountId: string,
    setlistId: string,
    editingUser: BaseUser,
    moveUp: Boolean = true
  ): any {
    const dbPath = `/accounts/${accountId}/setlists/${setlistId}/songs`;
    const setlistSongsRef = this.db.collection(dbPath);
    return this.getSetlistSongs(accountId, setlistId).pipe(
      concatMap((results: SetlistSong[]) => {
        const setlistSongs = moveUp ? results : results.reverse();
        const batch = this.db.firestore.batch();
        //Once the starting sequence number is found set this to true so the others can be incremented after.
        let isUpdating = false;
        let index = moveUp ? 1 : setlistSongs.length;
        for (const setlistSong of setlistSongs) {
          //Increment the sequence number if the sequenceNumber === startingSequenceNumber or it is updating.
          if (
            index === startingSequenceNumber ||
            (isUpdating && setlistSong.id !== setlistSongToInsert.id)
          ) {
            this.setSetlistSongSequenceNumberForBatch(
              (setlistSong.sequenceNumber = moveUp ? setlistSong.sequenceNumber + 1 : setlistSong.sequenceNumber - 1),
              setlistSongsRef,
              setlistSong,
              editingUser,
              batch
            );

            isUpdating = true;
          } else if (isUpdating && setlistSong.id === setlistSongToInsert.id) {
            this.setSetlistSongSequenceNumberForBatch(
              (setlistSong.sequenceNumber = startingSequenceNumber),
              setlistSongsRef,
              setlistSong,
              editingUser,
              batch
            );
            break;
          }
          index = moveUp ? index + 1: index - 1;
        }
        //Batch commit incrementing the setlist song sequence number.
        return from(batch.commit());
      })
    );
  }

  private setSetlistSongSequenceNumberForBatch(
    sequenceNumber: number,
    setlistSongsRef: AngularFirestoreCollection<unknown>,
    setlistSong: SetlistSong,
    editingUser: BaseUser,
    batch
  ) {
    const setlistSongRef = setlistSongsRef.doc(setlistSong.id).ref;
    const setlisSongForUpdate = SetlistSongHelper.getForUpdate(
      setlistSong,
      editingUser
    );
    setlisSongForUpdate.sequenceNumber = sequenceNumber;
    setlisSongForUpdate.lastUpdatedByUser = editingUser;
    batch.update(setlistSongRef, setlisSongForUpdate);
  }
}
