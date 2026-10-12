import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withXhr()),
    { provide: LOCALE_ID, useValue: 'hu-HU' },
    providePrimeNG({
      license: 'eyJpZCI6ImNkZTc1MTAyLTRiMDYtNGUzNy04ODdiLWI0NWQ0NGZlZTk4MSIsInByb2R1Y3QiOiJwcmltZXVpIiwidGllciI6ImNvbW11bml0eSIsInR5cGUiOiJkZXYiLCJpYXQiOjE3OTE2MzQ1NzMsImV4cCI6MTgyMzE3MDU3M30.zxV_7uXaNbG5bFRL7wZuHpPrNT1Ss9JlSHVEhTgIwuxTFf2RKx8gOSWTxFKYVHRrKxkO2rjVKSjAxwDAzTONCg',
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: 'none'
        }
      }
    })
  ]
  
};
