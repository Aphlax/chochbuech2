import {Component} from '@angular/core';
import {Recipe, recipeDisplay, RecipeDisplay} from "../utils/recipe";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {ActionStringComponent} from "../action-string/action-string.component";
import {MatIcon} from "@angular/material/icon";
import {AsyncPipe, NgClass} from "@angular/common";
import {FlexLayoutModule} from "@angular/flex-layout";
import {MatIconButton} from "@angular/material/button";
import {ScrollOnLoadDirective} from "../utils/scroll-on-load.directive";
import {map, Observable} from "rxjs";
import {MatSnackBar} from "@angular/material/snack-bar";
import {FlexLayoutServerModule} from "@angular/flex-layout/server";
import {BroadcastService} from "../broadcast.service";
import {PropertiesService} from "../utils/properties-service";

@Component({
  selector: 'recipe-page',
  standalone: true,
  imports: [FlexLayoutModule, FlexLayoutServerModule, ActionStringComponent, MatIcon, MatIconButton,
    NgClass, AsyncPipe, ScrollOnLoadDirective, RouterLink],
  templateUrl: './recipe-page.component.html',
  styleUrl: './recipe-page.component.scss'
})
export class RecipePageComponent {
  readonly recipe$: Observable<Recipe>;
  zoom = false;

  constructor(private readonly route: ActivatedRoute, private readonly snackBar: MatSnackBar,
              public readonly properties: PropertiesService, $broadcast: BroadcastService,
              router: Router) {
    this.recipe$ = this.route.data.pipe(map(data => data['recipe']));
    $broadcast.addRecipeToShoppingEvent.subscribe(() => this.recipe$.subscribe(recipe =>
      router.navigate(['/shopping-list'], {state: {["addRecipe"]: recipe}})));
  }

  get display$(): Observable<RecipeDisplay> {
    return this.recipe$.pipe(map(recipe => recipeDisplay(recipe)));
  }

  async shareRecipe(recipe: Recipe) {
    if ('share' in navigator) {
      await navigator.share({
        title: 'Chochbuech',
        text: recipe.name,
        url: window.location.toString()
      });
    } else if ('clipboard' in navigator) {
      await (navigator as any).clipboard.writeText(
        `${window.location}#${recipe.name.replaceAll(' ', '-')}`);
      this.snackBar.open('Link kopiert!', undefined, {duration: 1000});
    }
  }
}
