import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, from, map } from 'rxjs';
import { AccountImportHelper, AccountImport } from '../model/account-import';
import { BaseUser } from '../model/user';
import { AccountImportEvent } from '../model/account-import-event';

@Injectable({
  providedIn: 'root'
})
export class AccountImportService {
  
  constructor(private db: AngularFirestore) { }

  getImports(accountId: string): Observable<AccountImport[]> {
    const dbPath = `/accounts/${accountId}/imports`;
    const accountImportRef = this.db.collection(dbPath, (ref) =>
      ref.orderBy("dateCreated", "desc")
    );
    return accountImportRef.snapshotChanges().pipe(
      map((changes) =>
      changes.map((c) => {
        const accountImport = c.payload.doc.data() as AccountImport;
        return accountImport;
      })
    )
    );
  }

  getImportEvents(accountId: string, accountImportId: string): Observable<AccountImportEvent[]> {
    const dbPath = `/accounts/${accountId}/imports/${accountImportId}/events`;
    const accountImporEventstRef = this.db.collection(dbPath, (ref) =>
      ref.orderBy("eventTime", "desc")
    );
    return accountImporEventstRef.snapshotChanges().pipe(
      map((changes) =>
      changes.map((c) => {
        const accountImportEvent = c.payload.doc.data() as AccountImportEvent;
        accountImportEvent.id = c.payload.doc.id;
        return accountImportEvent;
      })
    )
    );
  }

  startImport(accountId: string): Observable<AccountImport[]> {
    const dbPath = `/accounts/${accountId}/imports`;
    const accountImportRef = this.db.collection(dbPath);
    return accountImportRef.snapshotChanges().pipe(
      map((changes) =>
      changes.map((c) => {
        const accountImport = c.payload.doc.data() as AccountImport;
        return accountImport;
      })
    )
    );
  }

  addImport(accountId: string, accountImport: AccountImport, editingUser: BaseUser): Observable<AccountImport> {
    const importForAdd = AccountImportHelper.getForAdd(editingUser, accountImport);
    
    const dbPath = `/accounts/${accountId}/imports`;
    const songsRef = this.db.collection(dbPath);
    
    let save$: Observable<any>;
    save$ = from(songsRef.add(importForAdd));
    return save$.pipe(
      map((res) => {
        const rtnImport = {
          id: res.id,
          ...importForAdd,
        };
        return rtnImport;
      })
    );
  }
}
