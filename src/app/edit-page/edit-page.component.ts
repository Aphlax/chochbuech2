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
import {ActivatedRoute, Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {RecipeService} from "../recipe.service";

@Component({
  selector: 'edit-page',
  standalone: true,
  imports: [FlexLayoutServerModule, FlexLayoutModule, MatIcon, FormsModule,
    MatRadioButton, MatButtonModule, MatLabel, MatRadioGroup, MatFormField, MatChipOption,
    MatCheckbox, MatChipListbox, AutoHeightDirective, MatInput, PictureInputComponent,
  ],
  templateUrl: './edit-page.component.html',
  styleUrl: './edit-page.component.scss'
})
export class EditPageComponent {
  readonly CATEGORY = RECIPE_CATEGORIES;
  readonly TAGS = ['Vegetarisch', 'Fisch', 'Fleisch', 'Pasta', 'Reis', 'Asiatisch'];
  recipe: Recipe = EMPTY_RECIPE;
  image: string | File = '';

  constructor(private readonly route: ActivatedRoute, private readonly snackBar: MatSnackBar,
              private readonly recipeService: RecipeService, private readonly router: Router) {
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
    try {
      this.recipeService.save(data).subscribe(response => {
        if (!response.offline) {
          this.router.navigate(['r', response.id]);
        }
      });
    } catch (e: any) {
      this.snackBar.open(e.status == 403 ? 'Zugriff verweigert.' :
          e.status == 500 ? 'Serverfehler.' : `Etwas ging schief (${e.status})`,
        undefined, {duration: 1000});
    }
  }

  saveEnabled(recipe: Recipe): boolean {
    return !!((!recipe.id || !isNaN(recipe.id)) &&
      recipe.image && recipe.name &&
      recipe.ingredients && recipe.steps && recipe.category &&
      (recipe.id || (recipe.image as any) instanceof File));
  }
}
