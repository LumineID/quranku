import { defineComponent, watch, onUnmounted } from "vue";
import styles from "./Book.module.scss";
import scroll from "@/helpers/scroll";

export default defineComponent({
    props: {
        visible: {
            type: Boolean,
            default: false
        }
    },
    setup(props) {
        onUnmounted(() => {
            scroll.enable();
        });

        watch(() => props.visible, (isVisible) => {
            isVisible ? scroll.disable() : scroll.enable();
        }, {immediate: true});
    },
    render() {
        return (
            <>
                <div class={[styles.loader_container,
                    {
                        [styles.visible]: this.visible, 
                        [styles.dark]: this.$setting.isDarkMode
                    }
                ]}>
                    <div>
                        <div class={styles.book}>
                            <div class={styles.book_pg_shadow}></div>
                            <div class={[styles.book_pg, styles.book_pg_1]}></div>
                            <div class={[styles.book_pg, styles.book_pg_2]}></div>
                            <div class={[styles.book_pg, styles.book_pg_3]}></div>
                            <div class={[styles.book_pg, styles.book_pg_4]}></div>
                            <div class={[styles.book_pg, styles.book_pg_5]}></div>
                        </div>
                        <div class="d-flex justify-content-center mt-3">
                            <h1 class={["text-primary font-alkalami", styles.book_name]}>
                                {this.$config.APP_NAME}
                            </h1>
                        </div>
                    </div>
                </div>
            </>
        )
    }
})