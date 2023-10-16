import { useChapters } from "@/hooks/chapters";
import { useHttpRetry } from "@/hooks/http";
import { defineComponent, PropType, ref, computed } from "vue";
import { Juzs, Chapters, Sort } from "@/types";
import { makeUrl } from "@/helpers/api";
import collect from "collect.js";
import styles from "../Style.module.scss";
import Icon from "@/components/Icon/Icon";

type Data = (Juzs & { chapters: Chapters[] })[]

export default defineComponent({
    props: {
        sort: {
            type: String as PropType<Sort>,
            required: true
        }
    },
    async setup(props) {
        const juzs = ref<Data>([]);
        const httpRetry = useHttpRetry();
        const chapters = useChapters();

        juzs.value = ((await httpRetry.get<{ juzs: Juzs[] }>(makeUrl("juzs"), {delay: 1000})).data.juzs).map(item => ({
            ...item,
            chapters: Object.keys(item.verse_mapping).map(
                id => chapters.find(Number(id))
            ).filter(item => item !== null) as Chapters[]
        }));

        const data = computed<Data>(() => {
            const collection = collect(juzs.value);
            return (props.sort == "desc"
                ? collection.sortByDesc("id")
                : collection.sortBy("id")
            ).toArray();
        })

        return {
            data
        }
    },
    render() {
        return this.data.map(item => (
            <div key={item.id} class="card mb-2">
                <div class="card-header text-center border-0">
                    <h6>{this.$t("general.juz")} {item.juz_number}</h6>
                </div>
                <div class="card-body">
                    <div class={styles.juz_container}>
                        {item.chapters.map(chapter => (
                            <div
                                key={chapter.id}
                                class={styles.card_chapter}
                                onClick={() => this.$router.push({name: "chapter", params: {id: chapter.id}})}
                            >
                                <div class="d-flex justify-content-between h-100">
                                    <div class="d-flex align-items-center">
                                        <div class="me-1 position-relative d-flex align-items-center text-center">
                                            <Icon class={styles.svg_icon} name="stars-islamic" width={60} height={60} />
                                            <span class="fw-bold h6 position-absolute text-primary" style="transform: translate(-50%, -50%);left: 50%;top: 50%">
                                                {chapter.id}
                                            </span>
                                        </div>
                                        <div class="ms-1">
                                            <div class="fw-bold h6 mb-0">{chapter.name_simple}</div>
                                            <small class="text-muted mb-0 mt-1">{chapter.translated_name.name}</small>
                                        </div>
                                    </div>
                                    <div class="d-flex align-items-center">
                                        <div>
                                            <div class="d-flex justify-content-end font-uthmanic" style={{ fontSize: "30px" }}>
                                                {chapter.name_arabic}
                                            </div>
                                            <div class="d-flex justify-content-end" style={{ fontSize: "13px" }}>
                                                <small class="text-muted">
                                                    {chapter.verses_count} {this.$t("general.ayah")}
                                                </small>
                                            </div>
                                            <div class="d-flex justify-content-end" style={{ fontSize: "13px" }}>
                                                <small class="text-muted">
                                                    {item.verse_mapping[chapter.id]}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>  
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ))
    }
})