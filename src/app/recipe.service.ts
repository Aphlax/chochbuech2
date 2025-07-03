import {Injectable} from '@angular/core';
import {Recipe} from "./utils/recipe";
import {HttpClient} from "@angular/common/http";
import {lastValueFrom, map, Observable} from "rxjs";

interface SaveResponse {
  id: number;
  offline: boolean;
}

export interface Properties {
  canEdit: boolean;
}

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

  save(data: FormData): Promise<SaveResponse> {
    return lastValueFrom(this.http.post('/save', data)
      .pipe(map(response => (response as any).data)));
  }

  search(query: string): Observable<Recipe[]> {
    return this.http.get<Recipe[]>('/look', {params: {'for': query}});
  }

  properties(): Observable<Properties> {
    return this.http.get<Properties>('/properties');
  }
}
