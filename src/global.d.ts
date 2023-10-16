import { Reactive, UnwrapNestedRefs, HTMLAttributes, ComponentCustomProps, ComponentCustomProperties } from "vue";
import { Config, UseSettings } from "./hooks/settings";
import { UseLocalStorage } from "./hooks/storage";
import { UseState } from "./hooks/state";
import { useChapter } from "./hooks/chapters";
import collect from "collect.js";
import toast from "./lib/toast";
import i18n from "./i18n";

export interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: "accepted" | "dismissed";
        platform: string;
    }>;
    prompt(): Promise<void>;
}

declare module "@vue/runtime-core" {
    export interface ComponentCustomProperties {
        $collect: typeof collect
        $toast: typeof toast
        $config: Config
        $setting: UnwrapNestedRefs<UseSettings>
        $storage: UnwrapNestedRefs<UseLocalStorage>
        $chapters: UnwrapNestedRefs<useChapter>
        $state: UnwrapNestedRefs<UseState>
    }

    export interface HTMLAttributes extends ComponentCustomProps {
        "v-clickHold"?: () => void
    }
}

declare global {
    interface WindowEventMap {
        beforeinstallprompt: BeforeInstallPromptEvent;
    }
}