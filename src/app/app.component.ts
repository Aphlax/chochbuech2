import {Component, ElementRef, ViewChild} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {AsyncPipe} from '@angular/common';
import {MatToolbar} from "@angular/material/toolbar";
import {MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {FlexLayoutModule} from "@angular/flex-layout";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatListModule} from "@angular/material/list";
import {FlexLayoutServerModule} from "@angular/flex-layout/server";
import {BroadcastService} from "./broadcast.service";
import {CookieService} from "ngx-cookie";
import {PropertiesService} from "./utils/properties-service";
import {MatBadge} from "@angular/material/badge";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, MatToolbar, MatIconButton, MatIcon, FlexLayoutModule,
    FlexLayoutServerModule, MatSidenavModule, MatListModule, AsyncPipe, MatBadge],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  @ViewChild('adminInput') readonly adminInput?: ElementRef;
  adminCount = 0;

  constructor(public readonly router: Router, public readonly $broadcast: BroadcastService,
              private readonly cookieService: CookieService,
              public readonly properties: PropertiesService) {
  }

  admin() {
    if (++this.adminCount != 10) return;
    const COOKIE_NAME = 'adminKey';
    const COOKIE_OPTIONS = {expires: new Date(new Date().setFullYear(new Date().getFullYear() + 5))};
    const input = this.adminInput?.nativeElement;
    if (!input) return;
    input.value = this.cookieService.get(COOKIE_NAME) ?? '';
    input.oninput = () => this.cookieService.put(COOKIE_NAME, input.value, COOKIE_OPTIONS);
    input.setAttribute('style', 'display: block;');
  }
}
