import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef as MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgIf } from '@angular/common';
import { MatDivider } from '@angular/material/divider';
import { AlertDialog } from 'src/app/core/model/alert-dialog';


export enum ALERT_DIALOG_RESULT {
  OK,
  CANCEL
}

@Component({
  selector: 'app-alert-dialog',
  standalone: true,
  imports: [MatDialogModule, NgIf, MatFormFieldModule, MatButtonModule, MatIconModule, MatDivider, MatProgressSpinnerModule],
  templateUrl: './alert-dialog.component.html',
  styleUrl: './alert-dialog.component.scss'
})

export class AlertDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<AlertDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AlertDialog,
  ) { 
  }

  onCancelClick(): void {
    this.dialogRef.close({result: ALERT_DIALOG_RESULT.CANCEL});
  }

  onOkClick(): void {
    this.dialogRef.close({result: ALERT_DIALOG_RESULT.OK});
  }
}
