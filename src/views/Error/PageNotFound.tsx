import MainLayout from "@/components/Layout/MainLayout";
import styles from "./PageNotFound.module.scss";
import { defineComponent, ref } from "vue";
import { useEventListener } from "@vueuse/core";

export default defineComponent({
    setup() {
        const size = ref<number>(document.documentElement.clientHeight);
        
        useEventListener(window, "resize", () => {
            size.value = document.documentElement.clientHeight;
        });

        return {
            size
        }
    },
    render() {
        return (
            <MainLayout>
                <div style={{ height: `${this.size - 110}px` }}>
                    <div class={styles.container}>
                        <div class={styles.smile}>
                            <h1>:(</h1>
                        </div>
                        <h2 class={styles.title}>Error - 404</h2>
                        <p class={styles.description}>
                            {this.$t("error.page-not-found")}
                        </p>
                        <div class={styles.button} onClick={() => this.$router.push({name: "home"})}>
                            {this.$t("general.home-page")}
                        </div>
                    </div>
                </div>
            </MainLayout>
        )
    }
})