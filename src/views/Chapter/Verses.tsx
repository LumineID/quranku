import { defineComponent, computed, ref, PropType, onMounted, h, onBeforeUnmount } from "vue";
import { useQuranReader } from "@/hooks/quran-reader";
import { useAudioPlayer } from "@/hooks/audio-player";
import { Chapters, Verses } from "@/types";
import { useDebounceFn, useIntersectionObserver } from "@vueuse/core";
import { useSettings } from "@/hooks/settings";
import Verse from "@/components/QuranReader/Verse";
import ArabicText from "@/components/QuranReader/ArabicText";
import Skeleton from "@/components/Skeleton/Skeleton";

type DataVerse = Verses & {
    highlight: boolean | number
}

export default defineComponent({
    inheritAttrs: false,
    props: {
        verses: {
            type: Array as PropType<Verses[]>,
            required: true
        },
        chapter: {
            type: Object as PropType<Chapters>,
            required: true
        }
    },
    setup(props, { expose }) {
        const el = ref<HTMLElement | null>(null);
        const visible = ref<boolean>(true);
        const size = ref<number>(0);
        const setting = useSettings();
        const { translateMode, highlightVerse } = useQuranReader();
        const { isShowTooltip } = useAudioPlayer();

        const key = computed<string>(() => {
            return props.verses.map(verse => verse.verse_key).join(",");
        });

        const data = computed<DataVerse[]>(() => {
            return props.verses.map(item => {
                let highlight: number | boolean = false;
    
                if (highlightVerse.value) {
                    const [id, verse, position] = highlightVerse.value.split(":");
                    if (id === props.chapter.id.toString() && Number(verse) === item.verse_number) {
                        highlight = position ? Number(position) : true;
                    }
                }

                return {...item, highlight} as DataVerse
            })
        });

        function getKey() {
            return key.value;
        }

        function setVisible(value: boolean) {
            visible.value = value;
        }

        function setSize(value: number) {
            if (el.value && visible.value) {
                size.value = value + 10;
            }
        }

        function renderItem(verse: DataVerse, key: number) {
            const attribute = {
                showTooltipWhenHighlight: isShowTooltip.value,
                showTransliterationInline: setting.transliteration.value && setting.transliterationDisplay.value.inline,
                showTransliterationTooltip: setting.transliteration.value && setting.transliterationDisplay.value.tooltip,
                showTranslationTooltip: setting.translation.value && setting.translationDisplay.value.tooltip,
                showTranslationInline: setting.translation.value && setting.translationDisplay.value.inline
            }

            const children = translateMode.value == "translated"
                ? <Verse
                    key={verse.id}
                    chapterId={props.chapter.id}
                    verseNumber={verse.verse_number}
                    words={verse.words}
                    translations={verse.translations}
                    highlight={verse.highlight}
                    {...attribute}
                />
                : <ArabicText
                    key={verse.id}
                    chapterId={props.chapter.id}
                    verseNumber={verse.verse_number}
                    words={verse.words}
                    highlight={verse.highlight}
                    enableHover={true}
                    buttons={["bookmark", "copy", "play", "tafsir"]}
                    {...attribute}
            />

            return h(translateMode.value == "read" ? "span" : "div", {
                "data-verse-key": verse.verse_key,
                "key": key
            }, children)
        }

        const observer = new ResizeObserver(useDebounceFn(() => {
            if (el.value) {
                setSize((el.value.querySelector("[data-id='wrapper']") as HTMLElement).offsetHeight);
            }
        }, 500));

        onMounted(() => {
            setSize(el.value!.offsetHeight);
            observer.observe(el.value!.querySelector("[data-id='wrapper']") as HTMLElement)
        });

        onBeforeUnmount(() => {
            observer.unobserve(el.value!.querySelector("[data-id='wrapper']") as HTMLElement)
        });

        useIntersectionObserver(el, ([{ isIntersecting }]) => {
            requestAnimationFrame(() => {
                visible.value = isIntersecting;
            })
        },{
            rootMargin: "600px",
            threshold: [0.2, 0.25, 0.5, 0.75, 1.0]
        });

        expose({
            getKey,
            setVisible
        });

        return {
            el,
            key,
            size,
            visible,
            translateMode,
            isShowTooltip,
            data,
            renderItem
        }
    },
    render() {
        return (
            <div data-verse-keys={this.key} style={{ minHeight: `${this.size}px` }} ref="el">
                <div data-id="wrapper">
                    {this.visible ? this.data.map(this.renderItem) : (
                        <Skeleton
                            width="100%"
                            height={`${this.size}px`}
                            borderRadius="10px"
                        />
                    )}
                </div>
            </div>
        )
    }
});