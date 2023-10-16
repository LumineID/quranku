import { getVerseByKey } from "@/helpers/api";
import { Verses } from "@/types";
import { useHttpRetry } from "@/hooks/http";
import { useSettings } from "@/hooks/settings";
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { useQuranReader } from "@/hooks/quran-reader";
import { NotFoundException } from "@/exceptions";
import Verse from "@/components/QuranReader/Verse";
import ArabicText from "@/components/QuranReader/ArabicText";
import sleep from "@/helpers/sleep";
import Error from "@/components/Error/Error";

export default defineComponent({
    props: {
        chapterId: {
            type: Number,
            required: true
        },
        verseNumber: {
            type: Number,
            required: true
        }
    },
    async setup(props) {
        const { translateMode } = useQuranReader();
        const router = useRouter();
        const httpRetry = useHttpRetry();
        const setting = useSettings();
        const verse = ref<Verses | null>(null);

        const key = [props.chapterId, props.verseNumber].join(":");

        function renderElement(verse: Verses) {
            const attribute = {
                showTransliterationInline: setting.transliteration.value && setting.transliterationDisplay.value.inline,
                showTransliterationTooltip: setting.transliteration.value && setting.transliterationDisplay.value.tooltip,
                showTranslationTooltip: setting.translation.value && setting.translationDisplay.value.tooltip,
                showTranslationInline: setting.translation.value && setting.translationDisplay.value.inline
            }

            if (translateMode.value == "translated") {
                return (
                    <Verse
                        verseNumber={verse.verse_number}
                        chapterId={props.chapterId}
                        words={verse.words}
                        translations={verse.translations}
                        showFooter={false}
                        buttons={["bookmark", "copy", "tafsir"]}
                        {...attribute}
                    />
                )
            } else {
                return (
                    <ArabicText
                        verseNumber={verse.verse_number}
                        chapterId={props.chapterId}
                        words={verse.words}
                        buttons={["bookmark", "copy", "tafsir"]}
                        {...attribute}
                    />
                )
            }
        }

        try {
            await sleep(1000)
            verse.value = await httpRetry.promise(getVerseByKey(key, setting.locale.value));
        } catch (e) {
            throw new NotFoundException("error.verse-not-available-for-this-surah");
        }

        return {
            verse,
            translateMode,
            renderElement
        }
    },
    render() {
        if (!this.verse) {
            return (
                <Error title="Tafisrs not found" description="TafsirNot founds" />
            )
        }

        return (
            <div style={{ direction: this.translateMode == "translated" ? "ltr" : "rtl" }}>
                {this.renderElement(this.verse)}
            </div>
        )
    }
})