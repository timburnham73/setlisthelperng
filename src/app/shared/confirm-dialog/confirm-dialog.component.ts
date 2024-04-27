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


export enum CONFIRM_DIALOG_RESULT {
  OK,
  CANCEL
}

export interface ConfirmDialog {
  title: string,
  message: string,
  message2: string,
  okButtonText: string,
  cancelButtonText: string
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, NgIf, MatFormFieldModule, MatButtonModule, MatIconModule, MatDivider, MatProgressSpinnerModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})

export class ConfirmDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialog,
  ) { 
  }

  onCancelClick(): void {
    this.dialogRef.close({result: CONFIRM_DIALOG_RESULT.CANCEL});
  }

  onOkClick(): void {
    this.dialogRef.close({result: CONFIRM_DIALOG_RESULT.OK});
  }
}
