import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { catchError, map } from "rxjs/operators";
import { Router } from "@angular/router";
import { UserRoles } from "../model/user-roles";
import { AngularFirestore, AngularFirestoreCollection } from "@angular/fire/compat/firestore";
import { User } from "../model/user";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { JwtToken } from "../model/JwtToken";

@Injectable({
  providedIn: "root",
})
export class UserService {
  private dbPath = '/users';
  userRef: AngularFirestoreCollection<User>;

  constructor(
    private afAuth: AngularFireAuth, 
    private router: Router,
    public httpClient: HttpClient,
    private db: AngularFirestore) {
      this.userRef = db.collection(this.dbPath);
    
  }

  addUser(authUser: any): any {
    const userToAdd : User = {uid: authUser.uid, displayName: authUser.displayName ?? '', photoUrl: authUser.photoUrl ?? '', email: authUser.email ?? '' }
    return this.userRef.add(userToAdd);
  }

  getUserById(uid: string): Observable<User>{
    return this.db
      .collection(this.dbPath, (ref) =>
        ref.where("uid", "==", uid)
      )
      .get()
      .pipe(
        map((results) =>
          results.docs.map((snap) => {
            return { id: snap.id, ...(<any>snap.data()) };
          })[0]
        )
      );
  }

  getUserByEmail(emailAddress: string): Observable<User>{
    return this.db
      .collection(this.dbPath, (ref) =>
        ref.where("email", "==", emailAddress)
      )
      .get()
      .pipe(
        map((results) =>
          results.docs.map((snap) => {
            return { id: snap.id, ...(<any>snap.data()) };
          })[0]
        )
      );
  }

  loginToSetlistHelper(username: string, password: string): Observable<JwtToken>{
    const headers = new Headers();
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/x-www-form-urlencoded',
      })
    };
    const body = 'username=' + username + '&password=' + password + '&grant_type=password';

    return this.httpClient.post<JwtToken>('https://setlisthelper.azurewebsites.net/token', body, httpOptions )
    .pipe(
      catchError((err) => {
        return throwError(() => new Error(err));
      }),
      map((token: JwtToken) => {
        return token;
      })
    )
  }

  
}
