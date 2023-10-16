import { Chapters, Verses, Words, QuranReader } from "@/types";
import { defineComponent, PropType, computed } from "vue";
import { useChapters } from "@/hooks/chapters";
import styles from "./Verse.module.scss";
import Icon from "../Icon/Icon";
import Copy from "./Button/Copy";
import Tafsir from "./Button/Tafsir";
import Play from "./Button/Play";
import ArabicText from "./ArabicText";
import Bookmark from "./Button/Bookmark";

export default defineComponent({
    props: {
        words: {
            type: Array as PropType<Words[]>,
            required: true
        },
        chapterId: {
            type: Number,
            required: true
        },
        verseNumber: {
            type: Number,
            required: true
        },
        translations: {
            type: Array as PropType<Verses["translations"]>,
            required: true
        },
        highlight: {
            type: [Number, Boolean],
            default: false
        },
        showFooter: {
            type: Boolean,
            default: true
        },
        showTooltipWhenHighlight: {
            type: Boolean,
            default: false
        },
        showTransliterationInline: {
            type: Boolean,
            default: false
        },
        showTranslationInline: {
            type: Boolean,
            default: false
        },
        showTransliterationTooltip: {
            type: Boolean,
            default: false
        },
        showTranslationTooltip: {
            type: Boolean,
            default: false
        },
        buttons: {
            type: Array as PropType<QuranReader["PROPS_BUTTON"]>,
            default: () => ["bookmark", "copy", "tafsir", "play"]
        }
    },
    setup(props) {
        const chapters = useChapters();

        const verseKey = computed<string>(() => {
            return [props.chapterId, props.verseNumber].join(":")
        });

        const chapter = computed<Chapters | null>(() => {
            return chapters.find(props.chapterId)
        });

        const textUthmani = computed<string>(() => {
            return props.words.map(word => word.text_uthmani).join(" ");
        });

        return {
            verseKey,
            textUthmani,
            chapter
        }
    },
    render() {
        return (
            <div class={[styles.verse_container, {[styles.highlight]: this.highlight === true}]}>
                <div class="d-md-flex">
                    <div class="d-flex d-md-block">
                        <div class="mb-0 mb-md-3 me-1 me-md-0 position-relative d-flex align-items-center text-center">
                            <Icon
                                name="stars-islamic"
                                width={50}
                                height={50}
                                class={["text-primary", {
                                    [styles.icon_spin]: this.highlight !== false
                                }]}
                            />
                            <span class="fw-bold h6 position-absolute text-primary" style="transform: translate(-50%, -50%);left: 50%;top: 50%">
                                {this.verseNumber}
                            </span>
                        </div>
                        {this.buttons.includes("bookmark") && this.chapter !== null && (
                            <div class="mt-0 mt-md-2 ms-3 ms-md-1 d-flex align-items-center">
                                <Bookmark
                                    verseKey={this.verseKey}
                                    name={this.chapter.name_simple}
                                />
                            </div>
                        )}
                        {this.buttons.includes("copy") && (
                            <div class="mt-0 mt-md-2 ms-2 ms-md-1 d-flex align-items-center">
                                <Copy
                                    text={this.textUthmani}
                                />
                            </div>
                        )}
                        {this.buttons.includes("tafsir") && (
                            <div class="mt-0 mt-md-2 ms-2 ms-md-1 d-flex align-items-center">
                                <Tafsir
                                    chapterId={this.chapterId}
                                    verseNumber={this.verseNumber}
                                />
                            </div>
                        )}
                        {this.buttons.includes("play") && (
                            <div class="mt-0 mt-md-2 ms-2 ms-md-1 d-flex align-items-center">
                                <Play
                                    chapterId={this.chapterId}
                                    verseNumber={this.verseNumber}
                                />
                            </div>
                        )}
                    </div>
                    <div class="ms-md-4 w-100 h-100 w-100">
                        <div class={["d-flex justify-content-end mt-2 mt-md-5 w-100", styles.arabic_text_wrapper]}>
                            <ArabicText
                                words={this.words}
                                highlight={this.highlight}
                                showTooltipWhenHighlight={this.showTooltipWhenHighlight}
                                showTransliterationInline={this.showTransliterationInline}
                                showTranslationInline={this.showTranslationInline}
                                showTransliterationTooltip={this.showTransliterationTooltip}
                                showTranslationTooltip={this.showTranslationTooltip}
                            />
                        </div>
                        <div class="mt-3 fs-md-5 my-auto">
                            {this.translations.map(translation => (
                                <p key={translation.id} v-html={translation.text} />
                            ))}
                        </div>
                    </div>
                </div>
                {this.showFooter && <hr class="primary" />}
            </div>
        )
    }
})