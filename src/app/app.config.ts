import {ApplicationConfig, importProvidersFrom, provideZoneChangeDetection} from '@angular/core';
import {provideRouter, RouteReuseStrategy} from '@angular/router';

import {routes} from './app.routes';
import {provideClientHydration} from '@angular/platform-browser';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {provideHttpClient, withFetch} from "@angular/common/http";
import {MAT_TABS_CONFIG} from '@angular/material/tabs';
import {CookieModule} from "ngx-cookie";
import {ComponentReuseStrategy} from "./utils/component-reuse-strategy";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    {provide: MAT_TABS_CONFIG, useValue: {animationDuration: 200}},
    importProvidersFrom(CookieModule.withOptions()),
    {provide: RouteReuseStrategy, useValue: new ComponentReuseStrategy(['', 'search'])}
  ]
};
