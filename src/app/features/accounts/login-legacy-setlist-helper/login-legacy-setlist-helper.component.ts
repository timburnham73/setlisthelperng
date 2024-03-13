import { NgIf } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { catchError, map, throwError } from 'rxjs';
import { Account } from 'src/app/core/model/account';
import { AccountImport, AccountImportHelper } from 'src/app/core/model/account-import';
import { BaseUser, UserHelper } from 'src/app/core/model/user';
import { AccountImportService } from 'src/app/core/services/account-import.service';
import { AccountService } from 'src/app/core/services/account.service';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login-legacy-setlist-helper',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatDialogModule, NgIf, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './login-legacy-setlist-helper.component.html',
  styleUrl: './login-legacy-setlist-helper.component.scss'
})
export class LoginLegacySetlistHelperComponent implements OnInit{
  saving = false;
  currentUser: BaseUser;
  couldNotLogin: boolean = false;
  account?: Account;
  loginForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  get username() { return this.loginForm.get('username'); }

  constructor(
    public dialogRef: MatDialogRef<LoginLegacySetlistHelperComponent>,
    private authService: AuthenticationService,
    private afs: AngularFirestore,
    private accountService: AccountService,
    private accountImportService: AccountImportService,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public accountId: string,
  ) {
    
    this.accountService.getAccount(accountId).subscribe((account) => {
      this.account = account;
    });

    this.authService.user$.subscribe((user) => {
      if(user && user.uid){
        this.currentUser = UserHelper.getForUpdate(user);
      }
    });
  }

  onNoClick(): void {
    this.dialogRef.close()
  }

  onLogin(): void {
    this.couldNotLogin = false;
    const username = this.loginForm.value.username!;
    this.userService.loginToSetlistHelper(username, this.loginForm.value.password!)
    .pipe(
      catchError((err) => {
        this.couldNotLogin = true;
        return throwError(() => err);
        }
      ),
      map((token) => {
        const modifiedAccount = {...this.account, importToken: token.access_token} as Account;
        if(this.account && this.account.id){
          this.accountService.updateAccount(this.account.id, this.currentUser, modifiedAccount);
          const accountImport = AccountImportHelper.getForAdd(this.currentUser, {username: username, jwtToken:token.access_token} as AccountImport)
          this.accountImportService.addImport(this.account.id, accountImport, this.currentUser);
          //Call the cloud function to start Sync.
          /*this.http.post(environment.api.syncSetlistHelperData, {accountid: this.account?.id})
            .pipe(
              catchError(err => {
                console.log(err);
                alert("Could not login");
                return throwError(() => err);
              })
            )
            .subscribe(() =>
              alert("User created successfully")
            );*/
        }
        this.dialogRef.close();
      })
    ).subscribe();
  }

  ngOnInit(): void {
    
  }
}
