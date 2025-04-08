import {Component} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {FlexLayoutModule} from "@angular/flex-layout";
import {RouterModule} from "@angular/router";
import {Recipe} from "../utils/recipe";

@Component({
  selector: 'start-page',
  standalone: true,
  imports: [FlexLayoutModule, RouterModule],
  templateUrl: './start-page.component.html',
  styleUrl: './start-page.component.scss'
})
export class StartPageComponent {
  recipes: Recipe[] = [];

  constructor(private http: HttpClient) {
    http.get<Recipe[]>('http://choch-buech.ch/listRecipes', {params: {category: 'all'}})
      .subscribe(recipes => {
        this.recipes = recipes;
      });
  }
}
