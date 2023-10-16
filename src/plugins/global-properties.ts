import { useSettings } from "@/hooks/settings";
import { useLocalStorage } from "@/hooks/storage";
import { useState } from "@/hooks/state";
import { App, reactive } from "vue";
import { config } from "@/hooks/settings";
import { useChapters } from "@/hooks/chapters";
import toast from "@/lib/toast";
import collect from "collect.js";

export default {
    install(app: App) {
        app.config.globalProperties.$setting  = reactive(useSettings());
        app.config.globalProperties.$storage  = reactive(useLocalStorage());
        app.config.globalProperties.$chapters = reactive(useChapters());
        app.config.globalProperties.$state    = reactive(useState());
        app.config.globalProperties.$toast    = toast;
        app.config.globalProperties.$config   = config;
        app.config.globalProperties.$collect  = collect;
    }
}