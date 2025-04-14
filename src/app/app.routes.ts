import {ActivatedRouteSnapshot, ResolveFn, Routes} from '@angular/router';
import {StartPageComponent} from "./start-page/start-page.component";
import {ShoppingPageComponent} from "./shopping-page/shopping-page.component";
import {RecipePageComponent} from "./recipe-page/recipe-page.component";
import {Recipe} from "./utils/recipe";
import {inject} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {catchError, of} from "rxjs";


const recipeResolver: ResolveFn<Recipe> = (route: ActivatedRouteSnapshot) => {
  return inject(HttpClient)
    .get<Recipe>('/recipe/recipe' + route.paramMap.get('id'))
    .pipe(catchError(() => of()));
};

export const routes: Routes = [
  {path: '', component: StartPageComponent, pathMatch: 'full'},
  {path: 'shopping-list', component: ShoppingPageComponent},
  {
    path: 'r/:id',
    component: RecipePageComponent,
    resolve: {recipe: recipeResolver}
  },
];
