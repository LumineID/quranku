import removeEscapeQuote from "../helpers/remove-escape-quote";
import { UseMemoizeReturn, createGlobalState, useMemoize } from "@vueuse/core";
import { ref, computed, WritableComputedRef, Ref, readonly, DeepReadonly, watch } from "vue";
import { useHttpRetry } from "./http";
import { makeUrl } from "../helpers/api";
import { useSettings } from "./settings";
import { Locale } from "./settings";
import { Chapters } from "@/types";

export interface UseChapters {
    data: DeepReadonly<Ref<Chapters[]>>
    total: WritableComputedRef<number>
    get: UseMemoizeReturn<Promise<Chapters[]>, Locale[]>
    load: () => Promise<void>
    search: (query: string) => Chapters[]
    find: (id: number) => Chapters | null
}

function cleanupChapters(chapters: Chapters[]): Chapters[] {
    return chapters.map((item) => ({
        ...item,
        translated_name: {
            ...item.translated_name,
            name: removeEscapeQuote(item.translated_name.name)
        },
        name_simple: removeEscapeQuote(item.name_simple)
    }))
}

export const useChapters = createGlobalState<() => UseChapters>((): UseChapters => {
    const setting = useSettings();
    const data = ref<Chapters[]>([]);

    const get = useMemoize((language: Locale): Promise<Chapters[]> => {
        return useHttpRetry({retryWhen: () => true})
            .get<{ chapters: Chapters[] }>(makeUrl("chapters"), {params: { language }})
            .then(r => cleanupChapters(r.data.chapters));
    });

    async function load() {
        data.value = await get(setting.locale.value);
    }

    const total = computed<number>(() => {
        return data.value.length
    });

    const search = (query: string): Chapters[] => {
        if (!query?.trim()) {
            return data.value
        } else {
            return data.value.filter(
                item => item.name_simple?.toLowerCase()?.includes(query.toLowerCase())
            )
        }
    }

    const find = (id: number): Chapters | null => {
        return data.value.find(item => item.id == id) || null
    }

    watch(setting.locale, load);

    return {
        data: readonly(data),
        total,
        get,
        load,
        search,
        find
    }
});