import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LayoutComponent } from "src/app/shared/layout/layout.component";
import { RouterModule, Routes } from "@angular/router";
import {
  AngularFireAuthGuard,
  redirectUnauthorizedTo,
} from "@angular/fire/compat/auth-guard";
import { AccountImportEventsComponent } from "./account-import-events/account-import-events.component";

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: AccountImportEventsComponent, canActivate: [AngularFireAuthGuard], },
      { path: ':importid', component: AccountImportEventsComponent, canActivate: [AngularFireAuthGuard], },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ImportRoutingModule {}
