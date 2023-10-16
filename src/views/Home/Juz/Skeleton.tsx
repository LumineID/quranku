import { defineComponent } from "vue";
import Skeleton from "@/components/Skeleton/Skeleton";
import styles from "../Style.module.scss";

export default defineComponent({
    setup() {
        return () => [2, 1, 2, 2, 4].map((v, i) => (
            <div key={i} class="card mb-2">
                <div class="card-header d-flex justify-content-center border-0">
                    <Skeleton width="100px" height="20px" borderRadius="5px" />
                </div>
                <div class="card-body">
                    <div class={styles.juz_container}>
                        {Array(v).fill(0).map((_, key) => (
                            <Skeleton
                                key={key}
                                class={styles.card_chapter_skeleton}
                                width="100%"
                                height="80px"
                            />
                        ))}
                    </div>
                </div>
            </div>
        ))
    }
})