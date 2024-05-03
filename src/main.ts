import { enableProdMode, importProvidersFrom } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { environment } from "./environments/environment";
import { AppComponent } from "./app/app.component";
import { MatProgressBarModule as MatProgressBarModule } from "@angular/material/progress-bar";
import { MatButtonModule as MatButtonModule } from "@angular/material/button";
import { MatDividerModule } from "@angular/material/divider";
import { MatCardModule as MatCardModule } from "@angular/material/card";

import { AngularFireModule } from "@angular/fire/compat";

import {
  AngularFireAnalyticsModule,
  APP_NAME,
  APP_VERSION,
  DEBUG_MODE as ANALYTICS_DEBUG_MODE,
  ScreenTrackingService,
  UserTrackingService,
  COLLECTION_ENABLED,
} from "@angular/fire/compat/analytics";

import {
  AngularFirestoreModule,
  USE_EMULATOR as USE_FIRESTORE_EMULATOR,
  SETTINGS as FIRESTORE_SETTINGS,
} from "@angular/fire/compat/firestore";
import {
  AngularFireAuthModule,
  USE_DEVICE_LANGUAGE,
  USE_EMULATOR as USE_AUTH_EMULATOR,
} from "@angular/fire/compat/auth";
import {
  AngularFireFunctionsModule,
  USE_EMULATOR as USE_FUNCTIONS_EMULATOR,
} from "@angular/fire/compat/functions";
import { AngularFireAuthGuardModule } from "@angular/fire/compat/auth-guard";

import { NgxsModule } from "@ngxs/store";
import { LoggerModule } from "ngx-logger";
import { AccountStateModule } from "./app/core/store/account-state.module";
import { AppRoutingModule } from "./app/app-routing.module";
import { CustomMaterialModule } from "./app/custom-material/custom-material.module";
import { SharedModule } from "./app/shared/shared.module";
import { CoreModule } from "./app/core/core.module";
import { BrowserAnimationsModule, provideAnimations } from "@angular/platform-browser/animations";
import { BrowserModule, bootstrapApplication } from "@angular/platform-browser";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  provideFirestore,
} from "@angular/fire/firestore";
import { getApp, initializeApp, provideFirebaseApp } from "@angular/fire/app";
import {
  connectFunctionsEmulator,
  getFunctions,
  provideFunctions,
} from "@angular/fire/functions";
import { connectAuthEmulator, getAuth, provideAuth } from "@angular/fire/auth";
import { connectFirestoreEmulator } from "@angular/fire/firestore";

if (environment.production) {
  enableProdMode();
} else {
  console.log(environment.production);
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      AngularFireModule.initializeApp(environment.firebase),
      AngularFireAuthModule,
      AngularFireFunctionsModule,
      BrowserModule,
      BrowserAnimationsModule,
      CoreModule,
      SharedModule,
      CustomMaterialModule.forRoot(),
      AppRoutingModule,
      AccountStateModule,
      LoggerModule.forRoot({
        serverLoggingUrl: `http://my-api/logs`,
        level: environment.logLevel,
        serverLogLevel: environment.serverLogLevel,
      }),
      NgxsModule.forRoot([], {
        selectorOptions: {
          injectContainerState: false,
        },
      }),
      MatCardModule,
      MatDividerModule,
      MatButtonModule,
      MatProgressBarModule,
      AngularFireModule.initializeApp(environment.firebase),
      AngularFirestoreModule.enablePersistence({ synchronizeTabs: true }),
      AngularFireAuthModule,
      AngularFireAuthGuardModule,
      AngularFireAnalyticsModule,
      AngularFireFunctionsModule,
      // provide modular style for AppCheck, see app.browser/server
      provideFirebaseApp(() => initializeApp(environment.firebase))
    ),
    provideAnimations(),
    {
      provide: FIRESTORE_SETTINGS,
      useValue: { ignoreUndefinedProperties: true },
    },
    { provide: USE_AUTH_EMULATOR, useValue: environment.useEmulators ? ['http://localhost:9099'] : undefined },
    { provide: USE_FIRESTORE_EMULATOR, useValue: environment.useEmulators ? ['localhost', 8080] : undefined },
    { provide: USE_FUNCTIONS_EMULATOR, useValue: environment.useEmulators ? ['localhost', 5001] : undefined },
    //{ provide: USE_STORAGE_EMULATOR, useValue: environment.useEmulators ? ['localhost', 9199] : undefined },
    { provide: FIRESTORE_SETTINGS, useValue: { ignoreUndefinedProperties: true } },
    { provide: ANALYTICS_DEBUG_MODE, useValue: true },
    { provide: COLLECTION_ENABLED, useValue: true },
    
    { provide: USE_DEVICE_LANGUAGE, useValue: true },
    { provide: APP_VERSION, useValue: '0.0.0' },
    { provide: APP_NAME, useValue: 'Angular' },
  ],
}).catch((err) => console.error(err));
