import { Chapters, QuranReader, Words } from "@/types";
import { defineComponent, PropType, ref, watch, nextTick, onBeforeUnmount, VNode, computed, Teleport } from "vue";
import { Tooltip as BSTooltip, Popover as BSPopover } from "bootstrap";
import { useI18n } from "vue-i18n";
import { useChapters } from "@/hooks/chapters";
import Tooltip from "../Tooltip/Tooltip";
import ButtonBookmark from "./Button/Bookmark";
import ButtonCopy from "./Button/Copy";
import ButtonTafsir from "./Button/Tafsir";
import ButtonPlay from "./Button/Play";
import Popover from "../Popover/Popover";
import styles from "./ArabicText.module.scss";

export default defineComponent({
    props: {
        words: {
            type: Array as PropType<Words[]>,
            required: true
        },
        chapterId: {
            type: Number
        },
        verseNumber: {
            type: Number
        },
        highlight: {
            type: [Number, Boolean],
            default: false
        },
        enableHover: {
            type: Boolean,
            default: false
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
            default: () => []
        }
    },
    setup(props) {
        const trans = useI18n();
        const chapters = useChapters();
        const tooltipInstance = ref<Record<number, BSTooltip>>({});
        const popoverInstance =  ref<Record<number, BSPopover>>({});
        const popover = ref<BSPopover | null>(null);
        const isHover = ref<boolean>(false);
        const refs = ref<{ popoverContent: HTMLElement | null }>({
            popoverContent: null
        });

        const verseKey = computed<string>(() => {
            return [props.chapterId, props.verseNumber].filter(v => v !== undefined).join(":")
        });

        const chapter = computed<Chapters | null>(() => {
            return props.chapterId ? chapters.find(props.chapterId) : null
        });

        const textUthmani = computed<string>(() => {
            return props.words.map(word => word.text_uthmani).join(" ");
        });

        const shouldUseButton = computed<boolean>(() => {
            return props.buttons.length > 0 && props.chapterId !== undefined && props.verseNumber !== undefined
        });

        function isHighlightWord(position: number) {
            return (props.highlight === position);
        }

        function onInitTooltip(key: number) {
            return function (tooltip: BSTooltip) {
                tooltipInstance.value[key] = tooltip;
                if (props.showTooltipWhenHighlight && isHighlightWord(key)) {
                    nextTick(() => {
                        tooltip.show();
                    })
                }
            }
        }

        function onInitPopover(key: number) {
            return function (popover: BSPopover) {
                popoverInstance.value[key] = popover;
            }
        }

        function onClickHold(key: number) {
            return function () {
                Object.keys(popoverInstance.value).forEach((keys) => Number(keys) !== key && popoverInstance.value[Number(keys)]?.hide())
                popoverInstance.value[key]?.toggle();
                // hide tooltip after popover open
                setTimeout(() => tooltipInstance.value[key]?.hide(), 100);
            }
        }

        function onMouseOver(key: number) {
            isHover.value = true;
            if (!props.showTooltipWhenHighlight || !isHighlightWord(key)) {
                tooltipInstance.value[key]?.show();
            }
        }

        function onMouseLeave(key: number) {
            isHover.value = false;
            if (!props.showTooltipWhenHighlight || !isHighlightWord(key)) {
                tooltipInstance.value[key]?.hide();
            }
        }

        function getTooltipText(word: Words) {
            let text: string = "";

            if (props.showTranslationTooltip) {
                text+= `<div>${word.char_type_name == "end" ? trans.t("quran-reader.word-number", {ayah: word.translation.text.match(/[0-9]+/)?.[0]}).toLowerCase() : word.translation.text}</div>`;
            }

            if (props.showTranslationTooltip && props.showTransliterationTooltip) {
                text+= "<div class='border-top mt-1 mb-1'></div>";
            }

            if (props.showTransliterationTooltip) {
                text+= `<div>${word.char_type_name == "end" ? word.translation.text : word.transliteration.text}</div>`;
            }

            return text
        }

        function wordWrapper(word: Words, children: VNode) {
            if (!shouldUseButton.value) {
                return (
                    <>
                        {children}
                    </>
                )
            } else {
                return (
                    <Popover
                        key={`popover-${word.id}`}
                        placement="top"
                        options={{ html: true, trigger: "manual", content: () => refs.value.popoverContent! }}
                        onInit={onInitPopover(word.position)}
                        v-clickHold:$300_vibrate={onClickHold(word.position)}
                    >
                        {{
                            title: () => (
                                <div class="text-center">
                                    {trans.t("quran-reader.word-number", {ayah: props.verseNumber})}
                                </div>
                            ),
                            default: () => children
                        }}
                    </Popover>
                )
            }
        }

        watch(() => props.highlight, (value, oldValue) => {
            if (!props.showTooltipWhenHighlight) {
                return;
            }

            if (typeof value === "number") {
                tooltipInstance.value[value]?.show();
            }

            if (typeof oldValue === "number") {
                tooltipInstance.value[oldValue]?.hide();
            }
            
        });

        watch(() => props.showTooltipWhenHighlight, (value) => {
            if (typeof props.highlight == "number") {
                tooltipInstance.value[props.highlight]?.[value ? "show" : "hide"]();
            }
        });

        onBeforeUnmount(() => {
            isHover.value = false;
            Object.keys(tooltipInstance.value).forEach((key) => tooltipInstance.value[Number(key)]?.hide());
            Object.keys(popoverInstance.value).forEach((key) => popoverInstance.value[Number(key)]?.hide())
        });

        return {
            tooltipInstance,
            popoverInstance,
            verseKey,
            refs,
            chapter,
            textUthmani,
            popover,
            isHover,
            shouldUseButton,
            isHighlightWord,
            onInitTooltip,
            onInitPopover,
            onClickHold,
            onMouseOver,
            onMouseLeave,
            getTooltipText,
            wordWrapper,
        }
    },
    render() {
        return (
            <>
                <span dir="rtl" class={[styles.arabic_text, {
                    [styles.highlight]: this.highlight === true,
                    [styles.hover]: this.isHover && this.enableHover
                }]}>
                    {this.shouldUseButton && (
                        <div class="d-none">
                            <div ref={(ref) => this.refs.popoverContent = (ref as HTMLElement)} class="d-flex">
                                {this.buttons.includes("bookmark") && this.chapter !== null && (
                                    <ButtonBookmark
                                        verseKey={this.verseKey}
                                        name={this.chapter.name_simple}
                                    />
                                )}
                                {this.buttons.includes("copy") && (
                                    <ButtonCopy
                                        text={this.textUthmani}
                                    />
                                )}
                                {this.buttons.includes("tafsir") && (
                                    <ButtonTafsir
                                        chapterId={this.chapterId!}
                                        verseNumber={this.verseNumber!}
                                    />
                                )}
                                {this.buttons.includes("play") && (
                                    <ButtonPlay
                                        chapterId={this.chapterId!}
                                        verseNumber={this.verseNumber!}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                    {this.words.map(word => this.wordWrapper(word, (
                        <Tooltip
                            key={`tooltip-${word.id}`}
                            tag="div"
                            timeout={0}
                            options={{
                                trigger: "manual",
                                html: true,
                                delay: {show: 500, hide: 2000},
                                title: () => this.getTooltipText(word)
                            }}
                            class={[styles.text_wrapper, {
                                [styles.highlight_word]: this.isHighlightWord(word.position),
                                "ps-2": this.showTransliterationInline
                            }]}
                            onInit={this.onInitTooltip(word.position)}
                            {
                                ...{
                                    "data-word-position": word.position,
                                    "data-word-location": word.location,
                                    "data-word-type": word.char_type_name,
                                    "onmouseover": () => this.onMouseOver(word.position),
                                    "onmouseleave": () => this.onMouseLeave(word.position)
                                }
                            }
                        >
                            <div class={["fs-arabic-auto text-center", {
                                "font-uthmanic": word.char_type_name == "end",
                                "font-arabic-auto": word.char_type_name == "word"
                            }]}>
                                {word.text_uthmani}
                            </div>
                            {this.showTransliterationInline && (
                                <div class="text-center mt-1 mb-1">
                                    <i>{word.char_type_name == "word" ? word.transliteration.text : word.translation.text}</i>
                                </div>
                            )}
                            {this.showTranslationInline && (word.char_type_name == "word" || !this.showTransliterationInline) && (
                                <div class="text-center mt-1 mb-1">
                                    <p>{word.translation.text}</p>
                                </div>
                            )}
                        </Tooltip>
                    )))}
                </span>
            </>
        )
    }
})