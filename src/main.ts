import { enableProdMode, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { MatProgressBarModule as MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule as MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule as MatCardModule } from '@angular/material/card';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireModule } from '@angular/fire/compat';
import { NgxsModule } from '@ngxs/store';
import { LoggerModule } from 'ngx-logger';
import { AccountStateModule } from './app/core/store/account-state.module';
import { AppRoutingModule } from './app/app-routing.module';
import { CustomMaterialModule } from './app/custom-material/custom-material.module';
import { SharedModule } from './app/shared/shared.module';
import { CoreModule } from './app/core/core.module';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { getFirestore, initializeFirestore, persistentLocalCache, provideFirestore } from '@angular/fire/firestore';
import { getApp, provideFirebaseApp } from '@angular/fire/app';
import { connectFunctionsEmulator, getFunctions, provideFunctions } from '@angular/fire/functions'; 
import { connectAuthEmulator, getAuth, provideAuth } from "@angular/fire/auth";
import { connectFirestoreEmulator } from '@angular/fire/firestore';

if (environment.production) {
  enableProdMode();
}
else{
    console.log(environment.production)
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(
            AngularFireModule.initializeApp(environment.firebase), 
            AngularFirestoreModule,
        provideFunctions(() => {
            const functions = getFunctions();
            functions.region = "us-central1";
            if (!environment.production) {
                connectFunctionsEmulator(functions, "localhost", 5001);
            }
            return functions;
            }),
        
        provideAuth(() => {
            const auth = getAuth();
            if (!environment.production) {
                connectAuthEmulator(auth, "http://localhost:9099", {
                disableWarnings: false,
                });
            }
            return auth;
            }),
        
        provideFirestore(() => {
            const firestore = initializeFirestore(getApp(), {
                localCache: persistentLocalCache({
                
                }),
            });
            if (!environment.production) {
                connectFirestoreEmulator(firestore, "localhost", 8080);
            }
            return firestore;
        }),
        BrowserModule, 
        CoreModule, 
        SharedModule, 
        CustomMaterialModule.forRoot(), 
        AppRoutingModule, 
        AccountStateModule, 
        LoggerModule.forRoot({
            serverLoggingUrl: `http://my-api/logs`,
            level: environment.logLevel,
            serverLogLevel: environment.serverLogLevel
        }), NgxsModule.forRoot([], {
            selectorOptions: {
                injectContainerState: false
            }
        }), 
        MatCardModule, MatDividerModule, MatButtonModule, MatProgressBarModule),
        provideAnimations()
    ]
})
  .catch(err => console.error(err));
