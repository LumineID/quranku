import { createApp } from "vue";
import { useLocalStorage } from "./hooks/storage.ts";
import { useSettings } from "./hooks/settings.ts";
import { useState } from "./hooks/state.ts";
import App from "./App.tsx"
import VueGtag, { PluginOptions, event } from "vue-gtag";
import GlobalComponent from "./plugins/global-components";
import globalProperties from "./plugins/global-properties";
import directives from "./plugins/directives.tsx"
import Vue3Toastify from "vue3-toastify";
import i18n from "./i18n/index.ts";
import routes from "./routes/index.ts";
// css
import "./assets/scss/quran.scss";

useLocalStorage().load().then(() => {
    const setting = useSettings();
    const state = useState();
    const toastifyOptions = {
        position: "bottom-right",
        pauseOnHover: false,
        limit: 5,
        closeOnClick: true,
        autoClose: 1500,
        theme: setting.isDarkMode.value ? "dark" : "light"
    }

    const gtagOptions: PluginOptions = {
        appName: import.meta.env.VITE_APP_NAME,
        pageTrackerScreenviewEnabled: true,
        config: {
            id: import.meta.env.VITE_APP_GA_MEASUREMENT_ID
        }
    }

    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        state.set("PWA_PROMPT", e);
    });

    window.addEventListener("appinstalled", (e) => {
        e.preventDefault();
        state.set("PWA_PROMPT", null);
        event("appinstaled");
    });

    createApp(App)
        .use(routes)
        .use(i18n)
        .use(GlobalComponent)
        .use(globalProperties)
        .use(directives)
        .use(Vue3Toastify, toastifyOptions)
        .use(VueGtag, gtagOptions, routes)
        .mount("#app")
})
