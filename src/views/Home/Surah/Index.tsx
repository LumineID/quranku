import { Chapters, Sort } from "@/types";
import { useChapters } from "@/hooks/chapters";
import { PropType, computed, defineComponent } from "vue";
import collect from "collect.js";
import styles from "../Style.module.scss";
import Icon from "@/components/Icon/Icon";

export default defineComponent({
    props: {
        sort: {
            type: String as PropType<Sort>,
            required: true
        }
    },
    setup(props) {
        const chapters = useChapters();

        const data = computed<Chapters[]>(() => {
            const collection = collect(chapters.data.value);
            return (props.sort == "desc"
                ? collection.sortByDesc("id")
                : collection.sortBy("id")).toArray();
        });

        return {
            data
        }
    },
    render() {
        return (
            <div class="row">
                {this.data.map(chapter => (
                    <div key={chapter.id} class="col-12 col-md-6 col-lg-4 mb-2">
                        <div
                            class={[styles.card_chapter, styles.border_radius_1rem]}
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
                                            <small class="text-muted">{chapter.verses_count} {this.$t("general.ayah")}</small>
                                        </div>
                                    </div>
                                </div>
                            </div>  
                        </div>
                    </div>
                ))}
            </div>
        )
    }
})