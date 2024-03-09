import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginLegacySetlistHelperComponent } from './login-legacy-setlist-helper.component';

describe('LoginLegacySetlistHelperComponent', () => {
  let component: LoginLegacySetlistHelperComponent;
  let fixture: ComponentFixture<LoginLegacySetlistHelperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginLegacySetlistHelperComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoginLegacySetlistHelperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
