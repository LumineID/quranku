import { createGlobalState } from "@vueuse/core";
import { computed, ref, Ref, WritableComputedRef } from "vue";
import { useLocalStorage } from "./storage";
import { QuranReader } from "@/types";

interface UseQuranReader {
    highlightVerse: Ref<string | null>
    tafsirModal: Ref<QuranReader["TAFSIR_MODAL"]>
    translateMode: WritableComputedRef<QuranReader["READ_MODE"]>
}

export const useQuranReader = createGlobalState<() => UseQuranReader>((): UseQuranReader => {
    const storage = useLocalStorage();
    const highlightVerse = ref<string | null>(null);
    const tafsirModal = ref<QuranReader["TAFSIR_MODAL"]>({
        isOpen: false,
        chapterId: 0,
        verseNumber: 0
    });

    const translateMode = computed<QuranReader["READ_MODE"]>({
        set(value) {
            return storage.set("QURAN_READER:TRANSLATE_MODE", value);
        },
        get() {
            return storage.get("QURAN_READER:TRANSLATE_MODE", "translated");
        }
    });

    return {
        highlightVerse,
        translateMode,
        tafsirModal
    }
});