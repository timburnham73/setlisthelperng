import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountImportEventsComponent } from './account-import-events/account-import-events.component';
import { ImportRoutingModule } from './imports-routing.module';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ImportRoutingModule,
    AccountImportEventsComponent
  ]
})
export class ImportModule { }
