import {Component} from '@angular/core';
import {MatIcon} from "@angular/material/icon";
import {MatRadioButton, MatRadioGroup} from "@angular/material/radio";
import {FlexLayoutModule} from "@angular/flex-layout";
import {FlexLayoutServerModule} from "@angular/flex-layout/server";
import {MatChipListbox, MatChipOption} from "@angular/material/chips";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatCheckbox} from "@angular/material/checkbox";
import {AutoHeightDirective} from "../utils/auto-height.directive";
import {EMPTY_RECIPE, Recipe, RECIPE_CATEGORIES} from "../utils/recipe";
import {MatButtonModule} from '@angular/material/button';
import {MatInput} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import {PictureInputComponent} from "../picture-input/picture-input.component";
import {map} from "rxjs";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {RecipeService} from "../recipe.service";
import {AppComponent} from "../app.component";
import {AsyncPipe} from "@angular/common";
import {MatTooltip} from "@angular/material/tooltip";

const RECIPE_TOOLTIP = `Formatierung:
· Erste Linie kann mit "Vorbereitung:" starten.
· Jede folgende Zeile wird als Schritt dargestellt (Nummerierung nicht nötig).
· Nach der ersten komplett leeren Zeile beginnen die Notizen.`;

const INGREDIENTS_TOOLTIP = `Formatierung:
· Eine Zutat pro Linie.
· Zutaten können mit einem Titel gruppiert werden, z.B. "--Sauce".`;

@Component({
  selector: 'edit-page',
  standalone: true,
  imports: [FlexLayoutServerModule, FlexLayoutModule, MatIcon, FormsModule, AsyncPipe,
    MatRadioButton, MatButtonModule, MatLabel, MatRadioGroup, MatFormField, MatChipOption,
    MatCheckbox, MatChipListbox, AutoHeightDirective, MatInput, PictureInputComponent, RouterLink, MatTooltip,
  ],
  templateUrl: './edit-page.component.html',
  styleUrl: './edit-page.component.scss'
})
export class EditPageComponent {
  readonly CATEGORY = RECIPE_CATEGORIES;
  readonly RECIPE_TOOLTIP = RECIPE_TOOLTIP;
  readonly INGREDIENTS_TOOLTIP = INGREDIENTS_TOOLTIP;
  readonly TAGS = ['Vegetarisch', 'Fisch', 'Fleisch', 'Pasta', 'Reis', 'Asiatisch'];
  recipe: Recipe = EMPTY_RECIPE;
  image: string | File = '';

  constructor(private readonly route: ActivatedRoute, private readonly snackBar: MatSnackBar,
              private readonly recipeService: RecipeService, private readonly router: Router,
              public readonly app: AppComponent) {
    this.route.data.pipe(map(data => data['recipe']))
      .subscribe(recipe => {
        this.recipe = recipe;
        this.image = recipe.image;
      });
  }

  async save(recipe: Recipe, image: string | File) {
    const data = new FormData();
    if (recipe.id) {
      data.append('id', '' + recipe.id);
    }
    data.append('name', recipe.name);
    data.append('ingredients', recipe.ingredients = recipe.ingredients.replaceAll('\r\n', '\n'));
    data.append('steps', recipe.steps = recipe.steps.replaceAll('\r\n', '\n'));
    data.append('category', recipe.category);
    data.append('tags', recipe.tags.join(','));
    data.append('archived', `${(recipe.archived)}`);
    if (image instanceof File) {
      const imageData = new Blob([new Uint8Array(await image.arrayBuffer())],
        {type: image.type});
      data.append('image', imageData, image.name)
    }
    this.recipeService.save(data).subscribe({
      next: response => {
        if (!response.offline) {
          this.router.navigate(['r', response.id]);
        }
      },
      error: err => {
        this.snackBar.open(err.status == 403 ? 'Zugriff verweigert.' :
            err.status == 500 ? 'Serverfehler.' : `Etwas ging schief (${err.status})`,
          undefined, {duration: 1000});
      },
    });
  }

  saveEnabled(recipe: Recipe, image: string | File): boolean {
    return !!((!recipe.id || !isNaN(recipe.id)) &&
      image && recipe.name &&
      recipe.ingredients && recipe.steps && recipe.category &&
      (recipe.id || image instanceof File));
  }
}
