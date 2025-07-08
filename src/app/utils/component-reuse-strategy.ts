import {ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy} from "@angular/router";

export class ComponentReuseStrategy implements RouteReuseStrategy {
  private readonly storedComponents = new Map<string, DetachedRouteHandle>();

  constructor(private readonly routesToCache: string[]) {
  }

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return this.routesToCache.includes(route.routeConfig?.path!);
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    this.storedComponents.set(route.routeConfig?.path!, handle);
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return this.storedComponents.has(route.routeConfig?.path!);
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
    return this.storedComponents.get(route.routeConfig?.path!)!;
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, current: ActivatedRouteSnapshot): boolean {
    return future.routeConfig == current.routeConfig;
  }
}
