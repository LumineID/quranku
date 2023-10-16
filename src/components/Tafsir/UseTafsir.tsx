import { useVModel } from "@vueuse/core";
import { computed, defineComponent, Suspense, VNode, watch, nextTick } from "vue";
import { useSettings } from "@/hooks/settings";
import { useChapters } from "@/hooks/chapters";
import { Chapters } from "@/types";
import { useRoute, useRouter } from "vue-router";
import SelectChapter from "./SelectChapter";
import SelectAyah from "./SelectAyah";
import SelectLanguage from "./SelectLanguage";
import Content from "./Content";
import ContentSkeleton from "./ContentSkeleton";
import TafsirSwitcher from "./TafsirSwitcher";
import Button from "../Button/Button";
import historyReplaceState from "@/helpers/history-replace-state";

export type Attributes = Record<string, unknown>
export interface DefaultSlotProps {
    hasNextAyah: boolean
    hasPreviousAyah: boolean
    children: {
        selectChapter: (attrs?: Attributes) => VNode
        selectAyah: (attrs?: Attributes) => VNode
        selectLanguage: (attrs?: Attributes) => VNode
        tafsirSwitcher: (attrs?: Attributes) => VNode
        mainContent: (attrs?: Attributes) => VNode
        nextAyahButton: (attrs?: Attributes) => VNode
        previousAyahButton: (attrs?: Attributes) => VNode
    }
}

export default defineComponent({
    emits: {
        "change": (chapter: Chapters) => true,
        "update:language": (value: string) => true,
        "update:tafsirSlug": (value: string) => true,
        "update:verseNumber": (value: number) => true,
        "update:chapterId": (value: number) => true
    },
    props: {
        chapterId: {
            type: Number,
            default: 0
        },
        verseNumber: {
            type: Number,
            default: 0
        },
        tafsirSlug: {
            type: String,
            default: ""
        },
        language: {
            type: String,
            default: ""
        },
        shouldUpdateQuery: {
            type: Boolean,
            default: false
        }
    },
    setup(props, { emit }) {
        const router = useRouter();
        const route = useRoute();
        const setting = useSettings();
        const chapters = useChapters();
        const mChapterId = useVModel(props, "chapterId", emit, {passive: true});
        const mVerseNumber = useVModel(props, "verseNumber", emit, {passive: true});
        const mTafsirSlug = useVModel(props, "tafsirSlug", emit, {passive: true});
        const mLanguage = useVModel(props, "language", emit, {passive: true});

        const chapter = computed<Chapters | null>(() => {
            return chapters.find(mChapterId.value);
        });

        const tafsirId = computed<string>(() => {
            return [mChapterId.value, mVerseNumber.value].join(":")
        });

        const isValidPropsValue = computed<boolean>(() => {
            return (chapter.value !== null && mVerseNumber.value > 0 && mVerseNumber.value <= chapter.value.verses_count) 
        });

        const contentKey = computed<string>(() => {
            return [tafsirId.value, mTafsirSlug.value, setting.locale.value].toString();
        });

        const hasNextAyah = computed<boolean>(() => {
            return (chapter.value !== null && mVerseNumber.value < chapter.value.verses_count);
        });

        const hasPreviousAyah = computed<boolean>(() => {
            return (chapter.value !== null && mVerseNumber.value > 1);
        });

        function nextAyah() {
            if (hasNextAyah.value) {
                mVerseNumber.value++;
            }
        }

        function previousAyah() {
            if (hasPreviousAyah.value) {
                mVerseNumber.value--;
            }
        }

        function updateQuery() {
            if (props.shouldUpdateQuery) {
                historyReplaceState(router.resolve({name: "tafsir", params: {
                    id: [mChapterId.value, mVerseNumber.value].join(":"),
                    slug: mTafsirSlug.value
                }, query: { lang: mLanguage.value }}).href)
            } else if (isValidPropsValue.value) {
                historyReplaceState(`#${route.fullPath}`);
            }
        }

        watch(() => [
            props.shouldUpdateQuery,
            mChapterId.value,
            mVerseNumber.value,
            mTafsirSlug.value,
            mLanguage.value
        ].toString(), () => {
            nextTick(updateQuery)
        });

        watch(chapter, (chapter) => {
            if (chapter) emit("change", chapter);
        }, { immediate: true });
    
        return {
            mChapterId,
            mVerseNumber,
            mLanguage,
            mTafsirSlug,
            tafsirId,
            contentKey,
            hasNextAyah,
            hasPreviousAyah,
            isValidPropsValue,
            nextAyah,
            previousAyah
        }
    },
    render() {
        return this.$slots.default?.({
            hasNextAyah: this.hasNextAyah,
            hasPreviousAyah: this.hasPreviousAyah,
            children: {
                selectChapter: (attrs: Attributes = {}) => (
                    <SelectChapter v-model={this.mChapterId} {...{...attrs, onchange: () => this.mVerseNumber = 1}} />
                ),
                selectAyah: (attrs: Attributes = {}) => (
                    <SelectAyah chapterId={this.chapterId} v-model={this.mVerseNumber} {...attrs} />
                ),
                selectLanguage: (attrs: Attributes = {}) => (
                    <SelectLanguage v-model={this.mLanguage} {...attrs} />
                ),
                tafsirSwitcher: (attrs: Attributes = {}) => (
                    <TafsirSwitcher language={this.mLanguage} v-model={this.mTafsirSlug} {...attrs} />
                ),
                nextAyahButton: (attrs: Attributes = {}) => (
                    <Button onClick={this.nextAyah} disabled={!this.hasNextAyah} {...attrs}>
                        <font-awesome-icon icon="caret-right" class="me-2" /> {this.$t("tafsir-reader.next-ayah")}
                    </Button>
                ),
                previousAyahButton: (attrs: Attributes = {}) => (
                    <Button onClick={this.previousAyah} disabled={!this.hasPreviousAyah} {...attrs}>
                        <font-awesome-icon icon="caret-left" class="me-2" /> {this.$t("tafsir-reader.prev-ayah")}
                    </Button>
                ),
                mainContent: (attrs: Attributes = {}) => (
                    <div {...attrs}>
                        {this.mTafsirSlug
                            ? (
                                <>
                                    {this.isValidPropsValue ? (
                                        <Suspense key={this.contentKey}>
                                            {{
                                                fallback: () => (
                                                    <ContentSkeleton />
                                                ),
                                                default: () => (
                                                    <Content
                                                        tafsirId={this.tafsirId}
                                                        tafsirSlug={this.mTafsirSlug}
                                                    />
                                                )
                                            }}
                                        </Suspense>
                                    ) : (
                                        <>
                                            <div class="d-flex justify-content-center mb-2">
                                                <img src="/assets/svg/undraw_no_data_re_kwbl.svg" class="img-fluid" width="100" height="100" />
                                            </div>
                                            <p class="font-monospace text-center">
                                                {this.$t("tafsir-reader.tafsir-not-found")}
                                            </p>
                                        </>
                                    )}
                                </>
                            )
                            : <ContentSkeleton />
                        }
                    </div>
                )
            }
        })
    }
})