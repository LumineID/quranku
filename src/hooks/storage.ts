import md5 from "js-md5";
import { createGlobalState, useDebounceFn } from "@vueuse/core";
import { ref, readonly, DeepReadonly } from "vue";
import type { Ref } from "vue";

const STORAGE_NAME = "QURAN_KU";
const STORAGE_SIGNATURE_NAME = "QURAN_KU:SIGNATURE";
const SIGNATURE_KEY = import.meta.env.VITE_APP_NAME;

export interface UseLocalStorage {
    data: DeepReadonly<Ref<Record<string, any>>>
    set: (name: string, value: any) => void
    get: (name: string, defaults?: any) => any
    forget: (name: string) => void
    load: () => Promise<Record<string, any>>
}

const setSignature = useDebounceFn((data: Record<string, any>) => {
    const signatures = [];
    for (const key of Object.keys(data)) {
        signatures.push(key);
        signatures.push(JSON.stringify(data[key]));
    }

    /** disini membuat signature pada storage untuk melacak perubahan yang dibuat oleh aplikasi
     *  jika isi localStorage diubah langung di luar aplikasi melalui developer tools (Console) atau semacamnya
     *  maka signature ini akan berbeda atau tidak cocok
     */
    const signature = md5.create().update(`${SIGNATURE_KEY}[${signatures.join(':')}]`).hex();

    localStorage.setItem(STORAGE_SIGNATURE_NAME, signature);
}, 100)

export const useLocalStorage = createGlobalState<() => UseLocalStorage>((): UseLocalStorage => {
    const state = ref<Record<string, any>>({});

    function put(data: object) {
        state.value = data;
        localStorage.setItem(STORAGE_NAME, JSON.stringify(data));
        setSignature(data);
    }

    function set(name: string, values: any) {
        values = typeof values == "function"
            ? values(state.value[name])
            : values;

        put(Object.assign(state.value, {[name]: values}));
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
            put(state.value);
        }
    }

    function load(): Promise<Record<string, any>> {
        return new Promise((resolve) => {
            try {
                const signatureToCompare = localStorage.getItem(STORAGE_SIGNATURE_NAME);
                const encoded = String(localStorage.getItem(STORAGE_NAME));
                const data = JSON.parse(encoded);
        
                if (!signatureToCompare?.trim()) {
                    throw new Error();
                }
                
                const signatures = [];
                for (const key of Object.keys(data)) {
                    signatures.push(key);
                    signatures.push(JSON.stringify(data[key]));
                }
                
                const signature = md5.create().update(`${SIGNATURE_KEY}[${signatures.join(':')}]`).hex();
        
                if (signature !== signatureToCompare) {
                    console.warn("signature check failed!.");
                    throw new Error();
                }
                
                state.value = data;
            } catch (e) {
                state.value = {};
            } finally {
                resolve(state.value);
            }
        })
    }

    return {
        data: readonly(state),
        set,
        get,
        forget,
        load
    }
});