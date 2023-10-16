import { useEventListener, useVibrate } from "@vueuse/core";
import { Directive } from "vue";

const directive: Directive<HTMLElement, () => void> = {
    created(el, { value }) {
        if (typeof value !== "function") {
            throw new Error("click hold is not a function")
        }
    },
    mounted(el, { value, arg }) {
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        function start() {
            const match = arg?.match(/^\$([0-9]+)(?:(_vibrate))?$/);
            timeoutId = setTimeout(() => {
                if (match?.[2]) useVibrate({pattern: [50]}).vibrate();
                value();
            }, Number(match?.[1] || 500))
        }


        function stop() {
            timeoutId && clearTimeout(timeoutId);
        }

        // desktop
        useEventListener(el, "mousedown", start);
        useEventListener(el, "mouseup", stop);
        // mobile
        useEventListener(el, "touchstart", start);
        useEventListener(el, ["touchend", "touchmove", "touchcancel"], stop);
    }
}

export default directive;