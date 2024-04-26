import { Injectable } from '@angular/core';
import { from, map, Observable, of } from "rxjs";
import { Timestamp } from "@angular/fire/firestore";
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Setlist, SetlistHelper } from '../model/setlist';
import { Account } from '../model/account';
import { BaseUser } from '../model/user';

@Injectable({
  providedIn: 'root'
})
export class SetlistService {

  constructor(private db: AngularFirestore) { }


  getSetlist(accountId: string, setlistId: string): Observable<Setlist | undefined> {
    const dbPath = `/accounts/${accountId}/setlists`;
    const setlistsRef = this.db.collection(dbPath).doc(setlistId);
    return setlistsRef.snapshotChanges().pipe(
      map((resultSetlist) =>
          {
            const setlist = resultSetlist.payload.data() as Setlist;
            if(setlist){
              setlist.id = setlistId;
              return setlist;
            }
            return undefined;
          }
      )
    );
  }

  getSetlists(accountId: string): Observable<any> {
    const dbPath = `/accounts/${accountId}/setlists`;
    const setlistsRef = this.db.collection(dbPath, ref => ref.orderBy("gigDate", 'desc'));
    return setlistsRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          {
            const setlist = c.payload.doc.data() as Setlist;
            setlist.id = c.payload.doc.id;
            return setlist;
          }
        )
      )
    );
  }

  addSetlist(accountId: string, setlist: Setlist, editingUser: BaseUser): any {
    const setlistForUpdate = SetlistHelper.getForAdd(setlist, editingUser);
    
    const dbPath = `/accounts/${accountId}/setlists`;
    const setlistsRef = this.db.collection(dbPath);
    
    return from(setlistsRef.add(setlistForUpdate));
  }

  updateSetlist(accountId: string, setlistId: string, setlist: Setlist, editingUser: BaseUser): Observable<void> {
    const setlistForUpdate = SetlistHelper.getForUpdate(setlist, editingUser);
    
    const dbPath = `/accounts/${accountId}/setlists`;
    const setlistsRef = this.db.collection(dbPath);
    
    return from(setlistsRef.doc(setlistId).update(setlistForUpdate));
  }

  removeSetlist(
    setlistToDelete: Setlist,
    accountId: string,
    editingUser: BaseUser
  ): any {
    const dbPath = `/accounts/${accountId}/setlists`;
    const songsCollection = this.db.collection(dbPath);
    return from(songsCollection.doc(setlistToDelete.id).delete());
    
  }
}
