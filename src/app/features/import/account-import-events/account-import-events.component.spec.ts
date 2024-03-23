import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountImportEventsComponent } from './account-import-events.component';

describe('AccountImportEventsComponent', () => {
  let component: AccountImportEventsComponent;
  let fixture: ComponentFixture<AccountImportEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountImportEventsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AccountImportEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
