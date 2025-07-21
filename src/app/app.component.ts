import {Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {isPlatformBrowser} from '@angular/common';
import {MatToolbar} from "@angular/material/toolbar";
import {MatButtonModule, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {FlexLayoutModule} from "@angular/flex-layout";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatListModule} from "@angular/material/list";
import {FlexLayoutServerModule} from "@angular/flex-layout/server";
import {BroadcastService} from "./utils/broadcast.service";
import {CookieService} from "ngx-cookie";
import {PropertiesService} from "./utils/properties-service";
import {MatBadge} from "@angular/material/badge";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, MatToolbar, MatIconButton, MatIcon, FlexLayoutModule, MatButtonModule,
    FlexLayoutServerModule, MatSidenavModule, MatListModule, MatBadge],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  installPrompt?: any;
  @ViewChild('adminInput') readonly adminInput?: ElementRef;
  adminCount = 0;

  constructor(public readonly router: Router, public readonly $broadcast: BroadcastService,
              private readonly cookieService: CookieService,
              public readonly properties: PropertiesService,
              @Inject(PLATFORM_ID) private readonly platformId: Object) {
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('beforeinstallprompt', e =>
        (this.installPrompt = e) && e.preventDefault());
      window.addEventListener('appinstalled', () => this.installPrompt = undefined);
    }
  }

  install() {
    this.installPrompt!.prompt();
    this.installPrompt!.userChoice.then((result: string) =>
      result == "accepted" && (this.installPrompt = undefined));
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
