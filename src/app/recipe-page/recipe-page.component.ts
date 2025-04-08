import {AfterViewInit, Component, Directive, ElementRef} from '@angular/core';
import {Recipe, recipeDisplay, RecipeDisplay} from "../utils/recipe";
import {ActivatedRoute} from "@angular/router";
import {ActionStringComponent} from "../action-string/action-string.component";
import {MatIcon} from "@angular/material/icon";
import {AsyncPipe, NgClass} from "@angular/common";
import {FlexLayoutModule} from "@angular/flex-layout";
import {MatIconButton} from "@angular/material/button";
import {ScrollOnLoadDirective} from "../scroll-on-load.directive";

@Component({
  selector: 'recipe-page',
  standalone: true,
  imports: [FlexLayoutModule, ActionStringComponent, MatIcon, MatIconButton, NgClass, AsyncPipe, ScrollOnLoadDirective],
  templateUrl: './recipe-page.component.html',
  styleUrl: './recipe-page.component.scss'
})
export class RecipePageComponent {
  readonly recipe: Recipe;
  zoom = false;

  constructor(private readonly route: ActivatedRoute) {
    this.recipe = this.route.snapshot.data['recipe'];
  }

  get display(): RecipeDisplay {
    return recipeDisplay(this.recipe);
  }

  async shareRecipe() {
    if ('share' in navigator) {
      await navigator.share({
        title: 'Chochbuech',
        text: this.recipe.name,
        url: window.location.toString()
      });
    } else if ('clipboard' in navigator) {
      await (navigator as any).clipboard.writeText(
        `${window.location}#${this.recipe.name.replaceAll(' ', '-')}`);
      //  $mdToast.showSimple('Link kopiert!');
    }
  }
}
