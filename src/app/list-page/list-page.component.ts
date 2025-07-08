import {Component} from '@angular/core';
import {FlexLayoutModule} from "@angular/flex-layout";
import {FlexLayoutServerModule} from "@angular/flex-layout/server";
import {AsyncPipe} from "@angular/common";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {map, Observable} from "rxjs";
import {Recipe} from "../utils/recipe";
import {MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'list-page',
  standalone: true,
  imports: [
    FlexLayoutModule, FlexLayoutServerModule, AsyncPipe, RouterLink, MatIconButton, MatIcon
  ],
  templateUrl: './list-page.component.html',
  styleUrl: './list-page.component.scss'
})
export class ListPageComponent {
  list$: Observable<Recipe[]>;

  constructor(private readonly route: ActivatedRoute) {
    this.list$ = this.route.data.pipe(map(data => data['list']));
  }
}
