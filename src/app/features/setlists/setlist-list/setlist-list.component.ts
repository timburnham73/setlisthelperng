import { Component, OnInit, ViewChild } from "@angular/core";
import { SetlistEditDialogComponent } from "../setlist-edit-dialog/setlist-edit-dialog.component";
import { MatTableDataSource as MatTableDataSource, MatTableModule } from "@angular/material/table";
import { AccountActions, AccountState } from "src/app/core/store/account.state";
import { MatDialog as MatDialog } from "@angular/material/dialog";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { Select, Store } from "@ngxs/store";
import { NGXLogger } from "ngx-logger";
import { Observable, first } from "rxjs";
import { Account } from "src/app/core/model/account";
import { SetlistService } from "src/app/core/services/setlist.service";
import { AccountSetlist } from "src/app/core/model/account-setlist";
import { Setlist } from "src/app/core/model/setlist";
import { SetlistSongService } from "src/app/core/services/setlist-songs.service";
import { SetlistSong } from "src/app/core/model/setlist-song";
import { NgIf, NgClass, NgFor, DatePipe } from "@angular/common";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatCardModule } from "@angular/material/card";
import { FlexLayoutModule } from "ngx-flexible-layout";
import { AuthenticationService } from "src/app/core/services/auth.service";
import { CONFIRM_DIALOG_RESULT, ConfirmDialogComponent } from "src/app/shared/confirm-dialog/confirm-dialog.component";

@Component({
    selector: "app-setlist-list",
    templateUrl: "./setlist-list.component.html",
    styleUrls: ["./setlist-list.component.css"],
    standalone: true,
    imports: [
        FlexLayoutModule,
        MatCardModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatSortModule,
        NgIf,
        NgClass,
        NgFor,
        DatePipe,
    ],
})
export class SetlistListComponent implements OnInit {
  @Select(AccountState.selectedAccount)
  selectedAccount$!: Observable<Account>;
  currentUser: any;
  showRemove = false;
  displayedColumns: string[] = ["name", "gigLocation", "gigDate", "setlistedit", "remove"];
  dataSource = new MatTableDataSource();
  accountId?: string;
  selectedSetlist?: Setlist;
  setlistSongs: SetlistSong[];

  //Used to display the sequence for the setlist songs.
  displaySequence = 1;
  //Used for numbering the rows to skip the
  setlistBreakCount = 0;

  @ViewChild(MatSort, { static: true })
  sort: MatSort = new MatSort();

  constructor(
    private logger: NGXLogger,
    private route: ActivatedRoute,
    private titleService: Title,
    private setlistService: SetlistService,
    private setlistSongsService: SetlistSongService,
    private authService: AuthenticationService,
    private store: Store,
    private router: Router,
    public dialog: MatDialog
  ) {

    this.authService.user$.subscribe((user) => {
      if(user && user.uid){
        this.currentUser = user;
      }
    });

    const selectedAccount = this.store.selectSnapshot(
      AccountState.selectedAccount
    );

    const id = this.route.snapshot.paramMap.get("accountid");
    if (id) {
      this.accountId = id;
      this.setlistService.getSetlists(this.accountId).subscribe((setlists) => {
        this.dataSource = new MatTableDataSource(setlists);
        if (setlists && setlists.length && this.selectedSetlist === undefined) {
          this.selectRow(setlists[0]);
        }
      });
    }
  }

  ngOnInit() {
    this.titleService.setTitle("Setlists");

    this.dataSource.sort = this.sort;
  }

  onAddSetlist() {
    const dialogRef = this.dialog.open(SetlistEditDialogComponent, {
      data: { accountId: this.accountId } as AccountSetlist,
      panelClass: "dialog-responsive",
    }).afterClosed().subscribe((setlist) => {
      if(setlist){
        this.router.navigate([setlist.id + '/songs'], { relativeTo: this.route } );
      }
    });

    
  }

  onEditSetlist(event, row: any) {
    event.preventDefault();
    const dialogRef = this.dialog.open(SetlistEditDialogComponent, {
      data: { accountId: this.accountId, setlist: row } as AccountSetlist,
      panelClass: "dialog-responsive",
    });
  }

  onViewSetlistSongs(event, row: any) {
    event?.preventDefault();
    this.router.navigate([row.id + '/songs'], { relativeTo: this.route } );
  }

  onPrintSetlist(){
    console.log('Not implmented');
  }

  onRemoveSetlist(event, setlistToDelete: Setlist) {
    event.preventDefault();
    let message = "Are you sure you want to delete this setlist?";
    let message2 = "";
    
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: "Delete", message: message, message2, okButtonText: "Yes", cancelButtonText: "Cancel"},
      panelClass: "dialog-responsive",
      width: '300px',
      enterAnimationDuration: '200ms', 
      exitAnimationDuration: '200ms',
      
    })
    .afterClosed().subscribe((data) => {
      if(data && data.result === CONFIRM_DIALOG_RESULT.OK){
        
          this.setlistService
              .removeSetlist(setlistToDelete, this.accountId!, this.currentUser)
              .pipe(first())
              .subscribe(); 
      }
    });
  }

  onEnableDeleteMode() {
    this.showRemove = !this.showRemove;
  }
  
  selectRow(row) {
    
    if (this.selectedSetlist === undefined || this.selectedSetlist?.id !== row.id) {
      this.setlistSongs = [];
      this.displaySequence = 1;
      this.setlistBreakCount = 0;
      this.selectedSetlist = row;
      this.setlistSongsService
        .getOrderedSetlistSongs(this.accountId!, this.selectedSetlist!.id!)
        .subscribe((setlistSongs) => {
          this.setlistSongs = setlistSongs.map((song, index) => {
            let breakCount = setlistSongs.slice(0, index).filter(song => song.isBreak === true).length;;
            const sequenceNumber = (index + 1) - breakCount;
            if(!song.isBreak){
              return {...song, sequenceNumber : sequenceNumber};
            }
            
            return {...song, sequenceNumber : sequenceNumber + .01};
          
          });
          
        });
    } 
  }

  getSequenceNumber(rowIndex: number, isBreak){
    if(isBreak){
      this.setlistBreakCount++;
    }
    
    const breakCount = this.setlistSongs.splice(0, rowIndex).filter(song => song.isBreak === true);
    if(breakCount){
      return rowIndex - breakCount.length;
    }
    
    return rowIndex + 1;
  }


}
