import {Component} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {MatToolbar} from "@angular/material/toolbar";
import {MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {FlexLayoutModule} from "@angular/flex-layout";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatListModule} from "@angular/material/list";
import {FlexLayoutServerModule} from "@angular/flex-layout/server";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, MatToolbar, MatIconButton, MatIcon, FlexLayoutModule, FlexLayoutServerModule, MatSidenavModule, MatListModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(public router: Router) {
  }

}
