import {Routes} from '@angular/router';
import {StartPageComponent} from "./start-page/start-page.component";
import {ShoppingPageComponent} from "./shopping-page/shopping-page.component";

export const routes: Routes = [
  {path: '', component: StartPageComponent},
  {path: 'shopping-list', component: ShoppingPageComponent},
];


