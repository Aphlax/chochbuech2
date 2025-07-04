import {Component} from '@angular/core';
import {FlexLayoutModule} from "@angular/flex-layout";
import {ActivatedRoute, RouterModule} from "@angular/router";
import {Recipe} from "../utils/recipe";
import {AsyncPipe} from "@angular/common";
import {map, Observable} from "rxjs";
import {MatTabsModule} from "@angular/material/tabs";
import {FlexLayoutServerModule} from "@angular/flex-layout/server";

interface Tab {
  label: string;
  category: string;
  recipes: Recipe[];
}

@Component({
  selector: 'start-page',
  standalone: true,
  imports: [FlexLayoutServerModule, FlexLayoutModule, RouterModule, AsyncPipe, MatTabsModule],
  templateUrl: './start-page.component.html',
  styleUrl: './start-page.component.scss'
})
export class StartPageComponent {
  tabs$: Observable<Tab[]>;

  constructor(private readonly route: ActivatedRoute) {
    this.tabs$ = route.data.pipe(map(data => data['tabs']));
  }
}
