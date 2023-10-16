import { useHttpRetry } from "@/hooks/http";
import { useSettings } from "@/hooks/settings";
import { defineComponent, ref, computed } from "vue";
import { getTafsirByAyah } from "@/helpers/api";
import ArabicText from "../QuranReader/ArabicText";
import sleep from "@/helpers/sleep";
import Alert from "../Alert/Alert";

export default defineComponent({
    props: {
        tafsirId: {
            type: String,
            required: true
        },
        tafsirSlug: {
            type: String,
            required: true
        }
    },
    async setup(props) {
        const httpRetry = useHttpRetry();
        const setting = useSettings();

        await sleep(500);

        const data = ref(await httpRetry.promise(getTafsirByAyah(props.tafsirId, props.tafsirSlug, setting.locale.value)));

        const versesKey = computed<string[]>(() => {
            return Object.keys(data.value.verses);
        });

        return {
            data,
            versesKey
        }
    },
    render() {
        return (
            <>
                {this.versesKey.length > 1 && (
                    <div class="mb-4">
                        <Alert type="info">
                            {this.$t("tafsir-reader.reading-group", {from: this.versesKey.shift(), to: this.versesKey.pop()})}
                        </Alert>
                    </div>
                )}
                
                <div class="mb-4">
                    <div style={{ direction: "rtl" }}>
                        <ArabicText
                            words={this.data.verses[this.tafsirId].words}
                        />
                    </div>
                    <hr />
                </div>

                {this.data.text.trim() == "" ? (
                    <>
                        <div class="d-flex justify-content-center mb-2">
                            <img src="/assets/svg/undraw_no_data_re_kwbl.svg" class="img-fluid" width="100" height="100" />
                        </div>
                        <p class="font-monospace text-center">
                            {this.$t("tafsir-reader.tafsir-unavailable", {tafsir: this.data.resource_name})}
                        </p>
                    </>
                ) : (
                    <div style={{ fontSize: "18px" }}>
                        <div class="tafsir-text-wrapper" v-html={this.data.text} />
                        <div class="mt-3">
                            {this.$t("general.source")} : <a target="_blank" href="https://quran.com">https://quran.com</a>
                        </div>
                    </div>
                )}
            </>
        )
    }
})