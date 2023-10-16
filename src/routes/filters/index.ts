import historyReplaceState from "@/helpers/history-replace-state";
import scroll from "@/helpers/scroll";
import sleep from "@/helpers/sleep";
import { useChapters } from "@/hooks/chapters";
import { useState } from "@/hooks/state";
import { RouteLocationNormalized, NavigationGuardNext, Router } from "vue-router";

export type Context = {
    router: Router
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
}

type Filters = Array<(context?: Context) => any>
type NextFactoryReturn = NavigationGuardNext | ((params?: any) => unknown)

function nextFactory(context: Context, filters: Filters, index: number): NextFactoryReturn  {
    const subsequentFilter = filters[index];

    if (!subsequentFilter) {
        return context.next;
    }

    function next() {
        const nextFilter = nextFactory(context, filters, index + 1);
        return subsequentFilter({...context, next: nextFilter})
    }

    return (params?: any) => {
        if (params == false) {
            return context.next(false);
        } else if (typeof params == "string" || (typeof params == "object" && params !== null && !Array.isArray(params))) {
            historyReplaceState(context.router.resolve(params).href);
            return context.next(params);
        } else {
            return next();
        }
    }
}

export default (router: Router) => async(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    const state = useState();
    const chapters = useChapters();
    
    scroll.enable();
    
    state.set("IS_FIRST_LOAD", (v: boolean | undefined) => v == undefined);
    state.set("LOADING_PAGE", state.get("IS_FIRST_LOAD") ? "book" : "progress");

    await Promise.all([chapters.load(), sleep(state.get("IS_FIRST_LOAD") ? 500 : 0)]);

    if (!to.meta.filter) {
        return next();
    }

    const filters: Filters = (Array.isArray(to.meta.filter)
        ? to.meta.filter
        : [to.meta.filter]) as Filters

    const context: Context = {router, to, from, next};
    const nextFilter = nextFactory(context, filters, 1);

    return filters[0]({...context, next: nextFilter})
}