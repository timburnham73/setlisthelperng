import { inject, Injectable } from "@angular/core";
import { from, map, Observable, of, pipe } from "rxjs";
import { Account, AccountHelper } from "../model/account";
import { Timestamp } from "@angular/fire/firestore";
import { SAMPLE_SONGS } from "../model/sampleSongs";

import {
  AngularFirestore,
  AngularFirestoreCollection,
} from "@angular/fire/compat/firestore";
import { BaseUser, User, UserHelper } from "../model/user";
import { AccountUser, AccountUserHelper } from "../model/AccountUser";
import { ADMIN } from "../model/roles";
import { convertSnaps } from "./db-utils";

//import OrderByDirection = firebase.firestore.OrderByDirection;

@Injectable({
  providedIn: "root",
})
export class AccountService {
  private collection = "accounts";

  private dbPath = "/accounts";

  accountsRef: AngularFirestoreCollection<Account>;

  constructor(private db: AngularFirestore) {
    this.accountsRef = db.collection(this.dbPath);
  }

  getAccounts(userId: string): Observable<Account[]> {
    return this.db
      .collection(this.dbPath, (ref) =>
        ref.where("users", "array-contains", userId)
      )
      .get()
      .pipe(
        map(results => convertSnaps<Account>(results))
      );
  }

  getAccount(accountId: string): Observable<any> {
    const dbPath = `/accounts`;
    const accountRef = this.db.collection(dbPath).doc(accountId);
    return accountRef.snapshotChanges().pipe(
      map((resultAccount) =>
          {
            const account = resultAccount.payload.data() as Account;
            account.id = accountId;
            return account;
          }
      )
    );
  }

  addAccount(account: Account, userAddingTheAccount: BaseUser, userToAdd: AccountUser): Observable<Account> {
    const accountToAdd = AccountHelper.getForAdd(userAddingTheAccount, account);
    accountToAdd.dateCreated = Timestamp.fromDate(new Date());

    let save$: Observable<any>;
    save$ = from(this.accountsRef.add(accountToAdd));
    
    return save$.pipe(
      map((res) => {
        const rtnAccount = {
          id: res.id,
          ...accountToAdd,
        };
        //Add the owner to the users.
        this.addUserToAccount(rtnAccount, userAddingTheAccount, userToAdd);
        return rtnAccount;
      })
    );
  }

  updateAccount(id: string, user: BaseUser, data: Account): Observable<void> {
    const accountForUpdate = AccountHelper.getForUpdate(user, data);

    return from(this.accountsRef.doc(id).update(accountForUpdate));
  }

  addSongsToAccount(account: Account) {
    const accountSongsRef = this.accountsRef
      .doc(account.id)
      .collection("/songs");
    accountSongsRef.add(SAMPLE_SONGS[0]);
    accountSongsRef.add(SAMPLE_SONGS[1]);
  }

  getAccountUsers(accountId: string): Observable<User[]> {
    const dbPath = `/accounts/${accountId}/users`;
    const usersRef = this.db.collection(dbPath);
    return usersRef.snapshotChanges().pipe(
      map((changes) =>
        changes.map((c) => {
          const user = c.payload.doc.data() as User;
          user.id = c.payload.doc.id;
          return user;
        })
      )
    );
  }

  addUserToAccount(account: Account, userUpdatingAccount: BaseUser, user: AccountUser) {
    const userToAdd = AccountUserHelper.getForUpdate(user);
    const accountUserRef = this.accountsRef
      .doc(account.id)
      .collection("/users");

    accountUserRef.add(userToAdd);
    if(!account.users?.find((uid) => uid === user.uid)){
      account.users?.push(userToAdd.uid);
    }

    if (account.id) {
      this.updateAccount(account.id, userUpdatingAccount, account);
    }
  }

  updateAccountUserRole(account: Account, user: AccountUser) {
    const accountUserRef = this.accountsRef
      .doc(account.id)
      .collection("/users")
      .doc(user.id);
      const userToUpdate = AccountUserHelper.getForUpdate(user);
      return from(accountUserRef.update(userToUpdate));
  }

  removeUserFromAccount(account: Account, user: User) {
    const accountUsersRef = this.accountsRef
      .doc(account.id)
      .collection("/users");

    //delete the user from the collection in the account.
    accountUsersRef.doc(user.id).delete();

    //Remove the uid from the users array on the account.
    if (account.id) {
      const uidIndex = account.users?.indexOf(user.uid);
      if (uidIndex && uidIndex > -1) {
        // only splice array when item is found
        account.users?.splice(uidIndex, 1); // 2nd parameter means remove one item only
      }
      this.updateAccount(account.id, user, account);
    }
  }
}
