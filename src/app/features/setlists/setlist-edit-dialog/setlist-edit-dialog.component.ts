import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef as MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Timestamp } from "@angular/fire/firestore";
import { AccountSetlist } from 'src/app/core/model/account-setlist';
import { Setlist } from 'src/app/core/model/setlist';
import { BaseUser, UserHelper } from 'src/app/core/model/user';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { SetlistService } from 'src/app/core/services/setlist.service';
import * as moment from "moment";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgIf } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';

@Component({
    selector: 'app-setlist-edit-dialog',
    templateUrl: './setlist-edit-dialog.component.html',
    styleUrls: ['./setlist-edit-dialog.component.css'],
    standalone: true,
    imports: [FormsModule, CalendarModule, ReactiveFormsModule, MatDialogModule, NgIf, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule]
})
export class SetlistEditDialogComponent {
  currentUser: BaseUser;
  saving = false;
  isNew = true;
  minimumGigDate = new Date();
  get name() { return this.setlistForm.get('name'); }
  get gigDate() { return this.setlistForm.get('name'); }

  //This is a good video for creating forms https://angular-university.io/lesson/angularfire-crud-create-part-1
  setlistForm = new FormGroup({
    name: new FormControl('', Validators.required),
    gigLocation: new FormControl(),
    gigDatePicker: new FormControl(new Date()),
  });

  constructor(
    public dialogRef: MatDialogRef<SetlistEditDialogComponent>,
    private setlistService: SetlistService,
    private authService: AuthenticationService,
    @Inject(MAT_DIALOG_DATA) public data: AccountSetlist,
  ) {
    
    this.authService.user$.subscribe((user) => {
      if (user && user.uid) {
        this.currentUser = UserHelper.getForUpdate(user);
      }
    });

    if(this.data && this.data.setlist){
      this.isNew = false;
    }

    let defaultGigDate = new Date();
    defaultGigDate.setDate(defaultGigDate.getDate() + 30);
    defaultGigDate.setHours(22,0,0,0);

    this.setlistForm.setValue({
      name: this.data.setlist?.name || '',
      gigLocation: this.data.setlist?.gigLocation || '',
      gigDatePicker: this.data.setlist?.gigDate ? this.data.setlist?.gigDate.toDate() : defaultGigDate
    })
    
    
  }

  

  onNoClick(): void {
    this.dialogRef.close()
  }

  onSave(): void {
    this.saving = true;
    
    //If the Date is modified do some manipulation with moment. 
    const modifiedSetlist = this.setlistForm.value as Setlist;
    if(this.setlistForm.get('gigDatePicker')?.dirty && this.setlistForm.value.gigDatePicker){
      modifiedSetlist.gigDate = Timestamp.fromDate(this.setlistForm.value.gigDatePicker);
    }
    else{
      modifiedSetlist.gigDate = this.data.setlist?.gigDate;
    }

    if(this.data.setlist?.id && this.data.accountId){
      this.setlistService.updateSetlist(this.data.accountId, this.data.setlist?.id, modifiedSetlist, this.currentUser).subscribe((ref) => {
        this.dialogRef.close(modifiedSetlist);
    });
    }else if(this.data.accountId){
      this.setlistService.addSetlist(this.data.accountId, modifiedSetlist, this.currentUser).subscribe((ref) => {
        modifiedSetlist.id = ref.id;
        this.dialogRef.close(modifiedSetlist);
      });
    }
    
  }


 
}
