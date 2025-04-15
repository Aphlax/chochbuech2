import {ActivatedRouteSnapshot, ResolveFn, Routes} from '@angular/router';
import {StartPageComponent} from "./start-page/start-page.component";
import {ShoppingPageComponent} from "./shopping-page/shopping-page.component";
import {RecipePageComponent} from "./recipe-page/recipe-page.component";
import {inject} from "@angular/core";
import {catchError, EMPTY, forkJoin, map} from "rxjs";
import {RecipeService} from "./recipe.service";

const TABS = [
  {label: 'Menu', category: 'easy'},
  {label: 'Apéro', category: 'starter'},
  {label: 'Dessert', category: 'dessert'},
];

export const routes: Routes = [
  {
    path: '',
    component: StartPageComponent,
    pathMatch: 'full',
    resolve: {
      tabs: () => forkJoin(TABS.map(tab => inject(RecipeService).list(tab.category)))
        .pipe(map(recipess => TABS.map((tab, i) => ({...tab, recipes: recipess[i]})))),
    },
  },
  {path: 'shopping-list', component: ShoppingPageComponent},
  {
    path: 'r/:id',
    component: RecipePageComponent,
    resolve: {
      recipe: (route: ActivatedRouteSnapshot) =>
        inject(RecipeService).get(route.paramMap.get('id') ?? '').pipe(catchError(() => EMPTY)),
    },
  },
];
