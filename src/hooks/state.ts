import { createGlobalState } from "@vueuse/core";
import { readonly, ref } from "vue";
import { Ref, DeepReadonly } from "vue";

export interface UseState {
    data: DeepReadonly<Ref<Record<string, any>>>
    set: (name: string, value: any) => void,
    get: (name: string, defaults?: any) => any
    forget: (name: string) => void
}

export const useState = createGlobalState<() => UseState>((): UseState => {
    const state: Ref<Record<string, any>> = ref({});

    function set(name: string, value: any) {
        state.value[name] = typeof value == "function"
            ? value(state.value[name])
            : value;
    }

    function get(name: string, defaults: any = null) {
        if (typeof defaults == "function") {
            defaults(state.value[name]);
        } else {
            return (typeof state.value[name] == "undefined" ? defaults : state.value[name])
        }
    }

    function forget(name: string) {
        if (!(typeof state.value[name] == "undefined")) {
            delete state.value[name];
        }
    }

    return {
        data: readonly(state),
        set,
        get,
        forget
    }
})