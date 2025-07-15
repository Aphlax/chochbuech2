import {Component, OnDestroy, OnInit} from '@angular/core';
import {Recipe, recipeDisplay, RecipeDisplay} from "../utils/recipe";
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {ActionStringComponent} from "../action-string/action-string.component";
import {MatIcon} from "@angular/material/icon";
import {AsyncPipe} from "@angular/common";
import {FlexLayoutModule} from "@angular/flex-layout";
import {MatIconButton} from "@angular/material/button";
import {ScrollOnLoadDirective} from "../utils/scroll-on-load.directive";
import {map, Observable} from "rxjs";
import {MatSnackBar} from "@angular/material/snack-bar";
import {FlexLayoutServerModule} from "@angular/flex-layout/server";
import {BroadcastService} from "../utils/broadcast.service";
import {PropertiesService} from "../utils/properties-service";

@Component({
  selector: 'recipe-page',
  standalone: true,
  imports: [FlexLayoutModule, FlexLayoutServerModule, ActionStringComponent, MatIcon, MatIconButton,
    AsyncPipe, ScrollOnLoadDirective, RouterLink],
  templateUrl: './recipe-page.component.html',
  styleUrl: './recipe-page.component.scss'
})
export class RecipePageComponent implements OnInit, OnDestroy {
  wakeLock?: WakeLockSentinel = undefined;
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

  visibilityChangeEvent = this.onVisibilityChange.bind(this);

  async ngOnInit() {
    document.addEventListener('visibilitychange', this.visibilityChangeEvent);
    document.addEventListener('fullscreenchange', this.visibilityChangeEvent);
    await this.engageWakeLock();
  }

  async ngOnDestroy() {
    document.removeEventListener('visibilitychange', this.visibilityChangeEvent);
    document.removeEventListener('fullscreenchange', this.visibilityChangeEvent);
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = undefined;
    }
  }

  async onVisibilityChange() {
    if (this.wakeLock?.released && document.visibilityState == 'visible') {
      return await this.engageWakeLock();
    }
  }

  async engageWakeLock() {
    if (!('wakeLock' in navigator && 'request' in navigator.wakeLock)) {
      return;
    }
    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
    } catch (e) {
    }
  }
}
