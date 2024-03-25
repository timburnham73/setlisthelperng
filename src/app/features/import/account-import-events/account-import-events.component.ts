import { DatePipe, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { BaseUser } from 'functions/src/model/user';
import { NGXLogger } from 'ngx-logger';
import { finalize, flatMap, mergeMap, pipe, switchMap, tap } from 'rxjs';
import { AccountImport } from 'src/app/core/model/account-import';
import { AccountImportEvent } from 'src/app/core/model/account-import-event';
import { AccountImportService } from 'src/app/core/services/account-import.service';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { AccountState } from 'src/app/core/store/account.state';
import { LOCALE_ID, Inject } from '@angular/core';

@Component({
  selector: 'app-account-import-events',
  standalone: true,
  imports: [MatCardModule, MatToolbarModule, MatButtonModule, MatIconModule, FormsModule, MatFormFieldModule, MatInputModule, NgIf, MatProgressSpinnerModule, MatTableModule, MatSortModule, DatePipe],
  templateUrl: './account-import-events.component.html',
  styleUrl: './account-import-events.component.scss'
})
export class AccountImportEventsComponent {
  currentUser: BaseUser;
  displayedColumns: string[] = ['eventType', 'message'];
  dataSource: AccountImportEvent[];
  accountImports: AccountImport[];
  currentAccountImport?: AccountImport;
  currentAccountImportDate: string | null;
  accountId: string;
  importId: string;
  loading = false;

  constructor(
    private logger: NGXLogger,
    private route: ActivatedRoute,
    private titleService: Title,
    private accountImportService: AccountImportService,
    private store: Store,
    private authService: AuthenticationService,
    private router: Router,
    @Inject(LOCALE_ID) public locale: string

  ) {
    this.titleService.setTitle("Account")
    this.authService.user$.subscribe((user) => {
      if (user && user.uid) {
        this.currentUser = user;
      }
    });
    const selectedAccount = this.store.selectSnapshot(AccountState.selectedAccount);
    const id = this.route.snapshot.paramMap.get('accountid');
    const importId = this.route.snapshot.paramMap.get('importid');
    if (id && importId) {
      this.loading = false;
      this.accountId = id;
      this.importId = importId;

      const accountEvents$ = this.accountImportService.getImports(this.accountId).pipe(
        switchMap((data) => {
          this.accountImports = data;
          this.currentAccountImport = data.find((accountImport) => accountImport.id === this.importId);
          if(this.currentAccountImport && this.currentAccountImport.lastEdit && this.currentAccountImport.lastEdit.seconds){
            const pipe = new DatePipe(this.locale);
            this.currentAccountImportDate = pipe.transform(this.currentAccountImport.lastEdit.toDate(), 'short');
          }
          return this.accountImportService.getImportEvents(this.accountId, this.importId);
        })
      );


      accountEvents$.subscribe(accountEvents => {
        return this.dataSource = accountEvents;
      });
    }
  }

  onBackToAccounts() {
    this.router.navigate([`/accounts`], {});
  }
}