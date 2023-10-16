import { createGlobalState } from "@vueuse/core";
import { ComponentPublicInstance, createApp } from "vue";

import AlertDialog, {AlertOptions, AlertResponse} from "../components/AlertDialog/AlertDialog";

interface Alert extends ComponentPublicInstance {
    alert(text: string, option?: AlertOptions): Promise<AlertResponse>
    confirm(text: string, option?: AlertOptions): Promise<AlertResponse>
    setGlobalOptions(option: AlertOptions): void
}

export const useAlert = createGlobalState(() => {
    const el = document.createElement("div");

    el.id = "alert__dialog"
    
    document.body.appendChild(el);

    const app = createApp(AlertDialog);

    return (app.mount(el) as Alert);
});