import { RouteLocationNormalized, NavigationGuardNext, Router } from "vue-router";

export type Context = {
    router: Router
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
}

export type Filters = Array<(context?: Context) => any>
export type NextFactoryReturn = NavigationGuardNext | ((params?: any) => unknown)