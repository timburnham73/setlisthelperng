import { NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseUser, UserHelper } from 'src/app/core/model/user';
import { AuthenticationService } from 'src/app/core/services/auth.service';

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
  loginForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  get username() { return this.loginForm.get('username'); }

  constructor(
    public dialogRef: MatDialogRef<LoginLegacySetlistHelperComponent>,
    
    private authService: AuthenticationService,
    private afs: AngularFirestore,
    
  ) {
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
    
    this.dialogRef.close();
  }

  ngOnInit(): void {
    
  }
}
