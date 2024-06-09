import { NgxLoggerLevel } from 'ngx-logger';

export const environment = {
  production: true,
  logLevel: NgxLoggerLevel.OFF,
  serverLogLevel: NgxLoggerLevel.ERROR,
  useEmulators: false,
  firebase: {
    projectId: 'setlisthelperfirebase',
    appId: '1:1090429457023:web:46b62263a22fc5efad254a',
    databaseURL: 'https://setlisthelperfirebase.firebaseio.com',
    storageBucket: 'setlisthelperfirebase.appspot.com',
    locationId: 'us-central',
    apiKey: 'AIzaSyCdE46hZGPCGViLXQ23TlkU4amwZJkk-8s',
    authDomain: 'setlisthelperfirebase.firebaseapp.com',
    messagingSenderId: '1090429457023',
    measurementId: 'G-WH7XCFGF5V',
  }
};
