import {ActivatedRouteSnapshot, Routes} from '@angular/router';
import {StartPageComponent} from "./start-page/start-page.component";
import {ShoppingPageComponent} from "./shopping-page/shopping-page.component";
import {RecipePageComponent} from "./recipe-page/recipe-page.component";
import {inject} from "@angular/core";
import {forkJoin, map, tap} from "rxjs";
import {RecipeService} from "./recipe.service";
import {EditPageComponent} from "./edit-page/edit-page.component";
import {EMPTY_RECIPE} from "./utils/recipe";
import {CookieService} from "ngx-cookie";
import {SearchPageComponent} from "./search-page/search-page.component";
import {ListPageComponent} from "./list-page/list-page.component";

const HISTORY_COOKIE = 'history';
const HISTORY_RETENTION_MS = 1000 * 60 * 60 * 24 * 14; // 14 days.

const TABS = [
  {label: 'Menu', category: 'menu'},
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
      history: () => JSON.parse(inject(CookieService).get(HISTORY_COOKIE) ?? "[]").filter((e: any) =>
        e.time > new Date().getTime() - HISTORY_RETENTION_MS),
    },
  },
  {path: 'shopping-list', component: ShoppingPageComponent},
  {
    path: 'r/:id',
    component: RecipePageComponent,
    resolve: {
      recipe: (route: ActivatedRouteSnapshot) => {
        const COOKIES = inject(CookieService);
        return inject(RecipeService).get(route.paramMap.get('id') ?? '').pipe(tap(recipe => {
          const history = JSON.parse(COOKIES.get(HISTORY_COOKIE) ?? "[]").filter((e: any) =>
            e.id != recipe.id && e.time > new Date().getTime() - HISTORY_RETENTION_MS);
          const entry = {id: recipe.id, image: recipe.image, time: new Date().getTime()};
          const newHistory = JSON.stringify([entry, ...history].slice(0, 12));
          const options = {expires: new Date(new Date().setDate(new Date().getDate() + 30))};
          COOKIES.put(HISTORY_COOKIE, newHistory, options);
        }));
      },
    },
  },
  {path: 'search', component: SearchPageComponent},
  {
    path: 'all', component: ListPageComponent, resolve: {
      list: () => inject(RecipeService).list('all'),
    }
  },
  {
    path: 'edit/:id',
    component: EditPageComponent,
    resolve: {
      recipe: (route: ActivatedRouteSnapshot) =>
        inject(RecipeService).get(route.paramMap.get('id') ?? ''),
    }
  },
  {
    path: 'new',
    component: EditPageComponent,
    resolve: {
      recipe: () => EMPTY_RECIPE,
    }
  },
];
