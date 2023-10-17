import i18n from "../i18n";
import { createGlobalState, usePreferredDark } from "@vueuse/core";
import { computed, watch, WritableComputedRef } from "vue";
import { updateGlobalOptions } from "vue3-toastify";
import { useLocalStorage } from "./storage";
import { useAlert } from "../lib/alert";
import { LocaleCode } from "@/types";
import copy from "@/helpers/copy";

export type Locale = "en" | "id";
export type FontType = "nastaleeq" | "uthmanic" | "me-quran" | "alqalam";
export type FontSize = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
export type Scale = 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1
export type Theme = "auto" | "light" | "dark";
export type Display = {
    inline: boolean
    tooltip: boolean
}

export interface UseSettings {
    theme: WritableComputedRef<Theme>
    fontSize: WritableComputedRef<FontSize>
    fontType: WritableComputedRef<FontType>
    locale: WritableComputedRef<Locale>
    scale: WritableComputedRef<Scale>
    isDarkMode: WritableComputedRef<boolean>
    transliteration: WritableComputedRef<boolean>
    translation: WritableComputedRef<boolean>
    transliterationDisplay: WritableComputedRef<Display>
    translationDisplay: WritableComputedRef<Display>
    resetToDefault: () => void
}

export interface DefaultSettings {
    locale: Locale
    theme: Theme
    font_size: FontSize
    font_type: FontType
    scale: Scale
    transliteration: boolean
    translation: boolean
    transliteration_display: Display
    translation_display: Display
}

export interface Config {
    APP_NAME: string
    API_PREFIX: string
    THEMES: Theme[]
    FONTS: FontType[]
    LOCALE: Record<LocaleCode, string>
    DEFAULT_SETTINGS: DefaultSettings
}

export const config: Config = {
    APP_NAME: import.meta.env.VITE_APP_NAME, 
    API_PREFIX: "https://api.quran.com/api/v4/",
    THEMES: [
        "auto",
        "light",
        "dark"
    ],
    FONTS: [
        "nastaleeq",
        "uthmanic",
        "me-quran",
        "alqalam"
    ],
    LOCALE: {
        id: "Indonesia",
        en: "English"
    },
    DEFAULT_SETTINGS: {
        locale: "id",
        theme: "auto",
        font_size: 3,
        font_type: "nastaleeq",
        scale: 1,
        transliteration: false,
        translation: true,
        transliteration_display: {
            inline: true,
            tooltip: false
        },
        translation_display: {
            inline: false,
            tooltip: true
        }
    }
}

export const useSettings = createGlobalState((): UseSettings => {
    const storage = useLocalStorage();
    const dialog = useAlert();
    const preferredDark = usePreferredDark();
    const trans = i18n.global;

    const theme = computed<Theme>({
        set(value: Theme) {
            storage.set("THEME", value);
        },
        get() {
            return storage.get("THEME", config.DEFAULT_SETTINGS.theme);
        }
    });

    const fontSize = computed<FontSize>({
        set(value: FontSize) {
            storage.set("FONT_SIZE", value);
        },
        get() {
            return storage.get("FONT_SIZE", config.DEFAULT_SETTINGS.font_size);
        }
    });

    const fontType = computed<FontType>({
        set(value: FontType) {
            storage.set("FONT_TYPE", value);
        },
        get() {
            return storage.get("FONT_TYPE", config.DEFAULT_SETTINGS.font_type);
        }
    });

    const locale = computed<LocaleCode>({
        set(value: LocaleCode) {
            storage.set("LOCALE", value);
        },
        get() {
            return storage.get("LOCALE", config.DEFAULT_SETTINGS.locale);
        }
    });

    const isDarkMode = computed<boolean>(() => {
        const isDark = theme.value == "auto"
            ? preferredDark.value
            : (theme.value == "dark");

        return isDark;
    });

    const transliteration = computed<boolean>({
        set(value: boolean) {
            storage.set("TRANSLITERATION", value);
        },
        get() {
            return Boolean(storage.get("TRANSLITERATION", config.DEFAULT_SETTINGS.transliteration))
        }
    });

    const translation = computed<boolean>({
        set(value: boolean) {
            storage.set("TRANSLATION", value);
        },
        get() {
            return Boolean(storage.get("TRANSLATION", config.DEFAULT_SETTINGS.translation))
        }
    });

    const transliterationDisplay = computed<Display>({
        set(value: Display) {
            storage.set("TRANSLITERATION_DISPLAY", value);
        },
        get() {
            return Object(storage.get("TRANSLITERATION_DISPLAY", config.DEFAULT_SETTINGS.transliteration_display));
        }
    });

    const translationDisplay = computed<Display>({
        set(value: Display) {
            storage.set("TRANSLATION_DISPLAY", value);
        },
        get() {
            return Object(storage.get("TRANSLATION_DISPLAY", config.DEFAULT_SETTINGS.translation_display));
        }
    });

    const scale = computed<Scale>({
        set(value: Scale) {
            storage.set("SCALE", value);
        },
        get() {
            return storage.get("SCALE", config.DEFAULT_SETTINGS.scale);
        }
    });

    watch(isDarkMode, (isDark) => {
        dialog.setGlobalOptions({darkMode: isDark})
        updateGlobalOptions({
            position: "bottom-right",
            pauseOnHover: false,
            limit: 5,
            closeOnClick: true,
            autoClose: 1500,
            theme: isDark ? "dark" : "light"
        });

        const metaThemeColor = document.querySelector("meta[name='theme-color']") as HTMLElement;

        if (isDark) {
            document.documentElement.setAttribute("data-bs-theme", "dark");
            metaThemeColor.setAttribute("content", "#343a40");
        } else {
            document.documentElement.removeAttribute("data-bs-theme");
            metaThemeColor.setAttribute("content", "#fff");
        }
    }, { immediate: true });

    watch(fontSize, (value: number) => {
        document.documentElement.setAttribute("arabic-font-size", String(value));
    }, { immediate: true });

    watch(fontType, (value: string) => {
        document.documentElement.setAttribute("arabic-font", String(value));
    }, { immediate: true });

    watch(transliterationDisplay, (value) => {
        storage.set("TRANSLITERATION_DISPLAY", value);
    }, { deep: true, immediate: true });

    watch(translationDisplay, (value) => {
        storage.set("TRANSLATION_DISPLAY", value);
    }, { deep: true, immediate: true });

    watch(locale, (value: string) => {
        // @ts-ignore
        i18n.global.locale = value;
        dialog.setGlobalOptions({
            confirmText: trans.t("alert.confirm-text"),
            cancelText: trans.t("alert.cancel-text")
        })
    }, { immediate: true });


    watch(scale, (value) => {
        const el = (document.querySelector("meta[name='viewport']") as HTMLElement);
        const content = el.getAttribute("content");
        const newContent = content?.replace(/initial-scale=[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/, () => `initial-scale=${value}`);
        el.setAttribute("content", newContent || "");
    }, { immediate: true });

    function resetToDefault() {
        theme.value = config.DEFAULT_SETTINGS.theme;
        fontSize.value = config.DEFAULT_SETTINGS.font_size;
        fontType.value = config.DEFAULT_SETTINGS.font_type;
        locale.value = config.DEFAULT_SETTINGS.locale;
        scale.value = config.DEFAULT_SETTINGS.scale;
        transliteration.value = config.DEFAULT_SETTINGS.transliteration;
        translation.value = config.DEFAULT_SETTINGS.translation;
        transliterationDisplay.value = copy(config.DEFAULT_SETTINGS.transliteration_display);
        translationDisplay.value = copy(config.DEFAULT_SETTINGS.translation_display);
    }

    return {
        theme,
        fontSize,
        fontType,
        locale,
        scale,
        isDarkMode,
        transliteration,
        translation,
        transliterationDisplay,
        translationDisplay,
        resetToDefault
    }
});

