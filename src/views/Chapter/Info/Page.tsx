import { useChapters } from "@/hooks/chapters";
import { useHttpRetry } from "@/hooks/http";
import { useSettings } from "@/hooks/settings";
import { defineComponent, ref } from "vue";
import { useRoute } from "vue-router";
import { Chapters, ChapterInfo } from "@/types";
import { getChapterInfo } from "@/helpers/api";
import sleep from "@/helpers/sleep";
import styles from "./Style.module.scss";
import setPageTitle from "@/helpers/set-page-title";

export default defineComponent({
    async setup() {
        const route = useRoute();
        const httpRetry = useHttpRetry();
        const setting = useSettings();
        const chapters = useChapters();
        const chapterId = Number(route.params.id);
        const chapter = ref<Chapters>(chapters.find(chapterId) as Chapters);

        setPageTitle(`Info - ${chapter.value.name_simple}`);

        await sleep(1000);

        const chapterInfo = ref<ChapterInfo>(await httpRetry.promise(getChapterInfo(chapterId, setting.locale.value)));

        return {
            chapter,
            chapterInfo
        }
    },
    render() {
        return (
            <>
                <div class="text-center">
                    <h4 class="font-monospace">{this.chapter.name_complex}</h4>
                    <p class="mb-1">{this.chapter.verses_count} {this.$t("general.ayah")}</p>
                    <p v-html={this.$t("quran-reader.revelation-place", {name: `<span class="text-capitalize">${this.chapter.revelation_place}</span>`})} />
                </div>
                <hr />
                <div class={styles.text}>
                    <div v-html={this.chapterInfo.text} />
                </div>
            </>
        )
    }
})