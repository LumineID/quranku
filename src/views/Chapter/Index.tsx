import { getChapterInfo, getVerseByChapter } from "@/helpers/api";
import { useHttpRetry } from "@/hooks/http";
import { useSettings } from "@/hooks/settings";
import { defineComponent, Suspense, computed, ref, watch, nextTick } from "vue";
import { useRoute } from "vue-router";
import { useChapters } from "@/hooks/chapters";
import { useQuranReader } from "@/hooks/quran-reader";
import { Chapters, LocaleCode } from "@/types";
import { useDebounceFn, useMemoize, useScroll } from "@vueuse/core";
import { useAudioPlayer } from "@/hooks/audio-player";
import ChapterLayout from "@/components/Layout/ChapterLayout";
import PageSkeleton from "./PageSkeleton";
import Page from "./Page";
import isElementInViewport from "@/helpers/is-element-in-viewport";
import TafsirModal from "@/components/Tafsir/TafsirModal";
import setPageTitle from "@/helpers/set-page-title";

export default defineComponent({
    setup() {
        const route = useRoute();
        const chapters = useChapters();
        const setting = useSettings();
        const httpRetry = useHttpRetry();
        const refs = ref<any>(null);
        const root = ref<HTMLElement | null>(null);
        const activeAyah = ref<number>(0);
        const page = ref<number>(0);
        const { translateMode, highlightVerse, tafsirModal } = useQuranReader();
        const { activeTimestamp, isPlaying, isAutoScroll, audioId } = useAudioPlayer();
        const { y } = useScroll(window);

        const chapterId = computed<number>(() => {
            return Number(route.params.id);
        });

        const chapter = computed<Chapters>(() => {
            return chapters.find(chapterId.value) as Chapters;
        });

        const keys = computed<string>(() => {
            return [
                translateMode.value,
                chapterId.value,
                setting.locale.value
            ].toString();
        });

        const getters = {
            VERSE: useMemoize(async(id: number, locale: LocaleCode) => {
                return await httpRetry.promise(getVerseByChapter(id, locale));
            }),
            INFO: useMemoize(async(id: number, locale: LocaleCode) => {
                return await httpRetry.promise(getChapterInfo(id, locale));
            })
        }

        function loaded(ctx: { firstPage: number }) {
            page.value = ctx.firstPage;
        }

        const resetHighlightVerse = useDebounceFn(() => {
            highlightVerse.value = null;
        }, 2000);

        function handleClickAyah(ayah: number) {
            refs.value?.scrollToVerse(ayah).then(() => {
                highlightVerse.value = [chapterId.value, ayah].join(":");
                nextTick(resetHighlightVerse);
            });
        }

        watch(y, () => {
            const pages: HTMLElement[] = Array.from(root.value?.querySelectorAll("[data-page]") || []);
            const verse: HTMLElement[] = Array.from(root.value?.querySelectorAll("[data-verse-key]") || []);
            
            const currentPage = pages.find(
                el => isElementInViewport(el, true)
            );

            const currentVerse = verse.find(
                el => isElementInViewport(el)
            );

            if (currentPage) {
                page.value = Number(currentPage.dataset.page)
            }

            if (currentVerse) {
                activeAyah.value = Number(currentVerse.dataset.verseKey?.split(":").pop());
            }
        });

        watch([activeTimestamp, isAutoScroll, isPlaying], ([activeTimestamp, isAutoScroll, isPlaying]) => {
            if (activeTimestamp && isAutoScroll && isPlaying && refs.value) {
                if (audioId.value === chapterId.value) {
                    const ayah = Number(activeTimestamp.verse_key.split(":").pop());
                    refs.value.scrollToVerse(ayah).then(() => {
                        // console.debug("scroll position", y.value)
                    }).catch(() => {
                        highlightVerse.value = null;
                    });
                }
            }
        });

        watch(chapter, (chapter) => {
            if (chapter) setPageTitle(chapter.name_simple);
        }, { immediate: true })

        return {
            chapterId,
            chapter,
            keys,
            getters,
            refs,
            root,
            page,
            activeAyah,
            tafsirModal,
            loaded,
            handleClickAyah
        }
    },
    render() {
        return (
            <>
                <TafsirModal
                    v-model:open={this.tafsirModal.isOpen}
                    v-model:chapterId={this.tafsirModal.chapterId}
                    v-model:verseNumber={this.tafsirModal.verseNumber}
                />
    
                <ChapterLayout
                    chapter={this.chapter}
                    page={this.page}
                    activeAyah={this.activeAyah}
                    onClickAyah={this.handleClickAyah}
                >
                    <div ref="root">
                        <Suspense key={this.keys}>
                            {{
                                fallback: () => (
                                    <PageSkeleton
                                        key={this.chapterId}
                                        chapter={this.chapter}
                                    />
                                ),
                                default: () => (
                                    <Page
                                        key={this.chapterId}
                                        chapter={this.chapter}
                                        getters={this.getters}
                                        onLoaded={this.loaded}
                                        ref="refs"
                                    />
                                )
                            }}
                        </Suspense>
                    </div>
                </ChapterLayout>
            </>
        )
    }
});