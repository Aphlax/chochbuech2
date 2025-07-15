import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {FlexLayoutModule} from "@angular/flex-layout";
import {FlexLayoutServerModule} from "@angular/flex-layout/server";
import {Recipe} from "../utils/recipe";
import {FormsModule} from "@angular/forms";
import {RouterLink} from "@angular/router";
import {RecipeService} from "../recipe.service";
import {
  concat,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  of,
  race,
  Subject,
  take
} from "rxjs";
import {AsyncPipe} from "@angular/common";
import {MatProgressSpinner} from "@angular/material/progress-spinner";

interface SearchCache {
  results: Recipe[];
  loading: boolean;
}

@Component({
  selector: 'search-page',
  standalone: true,
  imports: [
    FlexLayoutServerModule, FlexLayoutModule, FormsModule, RouterLink, AsyncPipe, MatProgressSpinner,
  ],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss'
})
export class SearchPageComponent implements AfterViewInit {
  @ViewChild('searchBar') readonly searchBar?: ElementRef;
  value: string = '';
  debounce = new Subject<string>();
  immediate = new Subject<string>();
  search$: Observable<SearchCache> = of({results: [], loading: false});

  constructor(private readonly recipeService: RecipeService) {
    this.listenSearchChange();
  }

  listenSearchChange() {
    race(this.debounce.pipe(debounceTime(500), distinctUntilChanged()), this.immediate)
      .pipe(take(1))
      .subscribe({
        next: (search: string) => {
          if (!search.length) {
            this.search$ = of({results: [], loading: false});
          } else {
            this.search$ = concat(this.search$.pipe(take(1), map(cache => ({
                ...cache,
                loading: true,
              }))),
              this.recipeService.search(search).pipe(map(results => ({results, loading: false}))));
          }
        },
        complete: () => this.listenSearchChange(),
      });
  }

  ngAfterViewInit(): void {
    if (this.searchBar)
      this.searchBar.nativeElement.focus();
  }
}
