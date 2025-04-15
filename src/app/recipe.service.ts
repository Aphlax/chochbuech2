import {Injectable} from '@angular/core';
import {Recipe} from "./utils/recipe";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  constructor(private http: HttpClient) {
  }

  get(id: string): Observable<Recipe> {
    return this.http.get<Recipe>('/recipe/recipe' + id);
  }

  list(category: string): Observable<Recipe[]> {
    return this.http.get<Recipe[]>('/listRecipes', {params: {category}});
  }

  search(query: string): Observable<Recipe[]> {
    return this.http.get<Recipe[]>('/look', {params: {'for': query}});
  }
}
