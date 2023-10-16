import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { useState } from "@/hooks/state";
import filters from "./filters";
import checkChapterId from "./filters/checkChapterId";

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        name: "home",
        component: () => import("@/views/Home/Index"),
        meta: {
            title: "Home"
        }
    },
    {
        path: "/surah/:id([0-9]+)",
        name: "chapter",
        component: () => import("@/views/Chapter/Index"),
        meta: {
            filter: checkChapterId(),
            title: "Surah"
        }
    },
    {
        path: "/surah/:id([0-9]+)/info",
        name: "chapter.info",
        component: () => import("@/views/Chapter/Info/Index"),
        meta: {
            filter: checkChapterId(),
            title: "Surah Info"
        }
    },
    {
        path: "/surah/:id([0-9]+)/:verse([0-9]+)",
        name: "chapter.verse",
        component: () => import("@/views/Verse/Index"),
        meta: {
            filter: checkChapterId(),
            title: "Ayah"
        }
    },
    {
        path: "/tafsir/:id([0-9]+:[0-9]+)/:slug([a-z\\-]+)",
        name: "tafsir",
        component: () => import("@/views/Tafsir/Index"),
        meta: {
            title: "Tafsirs"
        }
    },
    {
        path: "/prayer-schedule",
        name: "prayer-schedule",
        component: () => import("@/views/PrayerSchedule/Index"),
        meta: {
            title: "Prayer Schedule"
        }
    },
    {
        path: "/:catchAll(.*)",
        component: () => import("@/views/Error/PageNotFound"),
        meta: {
            title: "Page Not Found"
        }
    }
];

const router = createRouter({
    history: createWebHistory(),
    linkActiveClass: "active",
    linkExactActiveClass: "exact-active",
    scrollBehavior: () => ({ top: 0 }),
    routes,
});

router.beforeEach(filters(router))
router.afterEach(() => {
    useState().forget("LOADING_PAGE");
});

export default router;