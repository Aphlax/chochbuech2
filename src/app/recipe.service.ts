import {Injectable} from '@angular/core';
import {Recipe} from "./utils/recipe";
import {HttpClient} from "@angular/common/http";
import {Observable, of, tap} from "rxjs";

interface SaveResponse {
  id: number;
  offline: boolean;
}

const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes.

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private listCache = new Map<string, { data: Recipe[], timestamp: number }>();

  constructor(private http: HttpClient) {
  }

  get(id: string): Observable<Recipe> {
    if (id.length > 4) return of(null as unknown as Recipe);
    return this.http.get<Recipe>('/recipe/recipe' + id);
  }

  list(category: string): Observable<Recipe[]> {
    const cached = this.listCache.get(category);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return of(cached.data);
    }

    return this.http.get<Recipe[]>('/listRecipes', {params: {category}}).pipe(
      tap(items => this.listCache.set(category, {data: items, timestamp: Date.now()}))
    );
  }

  save(data: FormData): Observable<SaveResponse> {
    return this.http.post('/save', data) as Observable<SaveResponse>;
  }

  search(query: string): Observable<Recipe[]> {
    return this.http.get<Recipe[]>('/look', {params: {'for': query}});
  }
}
