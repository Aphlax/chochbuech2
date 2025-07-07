import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {FlexLayoutModule} from "@angular/flex-layout";
import {FlexLayoutServerModule} from "@angular/flex-layout/server";
import {Recipe} from "../utils/recipe";
import {FormsModule} from "@angular/forms";
import {RouterLink} from "@angular/router";
import {RecipeService} from "../recipe.service";
import {debounceTime, distinctUntilChanged, Observable, of, race, Subject, take} from "rxjs";
import {AsyncPipe} from "@angular/common";

@Component({
  selector: 'search-page',
  standalone: true,
  imports: [
    FlexLayoutServerModule, FlexLayoutModule, FormsModule, RouterLink, AsyncPipe,
  ],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss'
})
export class SearchPageComponent implements AfterViewInit {
  @ViewChild('searchBar') readonly searchBar?: ElementRef;
  search: string = '';
  debounce = new Subject<string>();
  immediate = new Subject<string>();
  searchResults$: Observable<Recipe[]> = of([]);

  constructor(private readonly recipeService: RecipeService) {
    this.listenSearchChange();
  }

  listenSearchChange() {
    race(this.debounce.pipe(debounceTime(500), distinctUntilChanged()), this.immediate)
      .pipe(take(1))
      .subscribe({
        next: (search: string) => {
          this.searchResults$ = !search.length ? of([]) : this.recipeService.search(search);
        },
        complete: () => this.listenSearchChange(),
      });
  }

  ngAfterViewInit(): void {
    if (this.searchBar)
      this.searchBar.nativeElement.focus();
  }
}
