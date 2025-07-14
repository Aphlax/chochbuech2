import {Inject, Injectable, PLATFORM_ID} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {firstValueFrom, tap} from "rxjs";
import {isPlatformServer} from "@angular/common";

export interface Properties {
  canEdit: boolean;
}

@Injectable({providedIn: 'root'})
export class PropertiesService {
  private properties: Properties = {canEdit: false};

  constructor(private readonly http: HttpClient,
              @Inject(PLATFORM_ID) private readonly platformId: Object) {
  }

  load(): Promise<Properties> {
    if (isPlatformServer(this.platformId)) {
      return Promise.resolve(this.properties);
    }

    return firstValueFrom(this.http.get<Properties>('/properties').pipe(
      tap(properties => this.properties = properties)));
  }

  get() {
    return this.properties;
  }
}
