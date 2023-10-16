import { defineComponent } from "vue";
import { useQuranReader } from "@/hooks/quran-reader"

export default defineComponent({
    setup() {
        const { translateMode } = useQuranReader();

        return {
            translateMode
        }
    },
    render() {
        return (
            <>
                <nav class="nav nav-pills custom-nav-pills">
                    <div class={["nav-link", {active: this.translateMode == "translated"}]} onClick={() => this.translateMode = "translated"}>
                        {this.$t("quran-reader.translated")}
                    </div>
                    <div class={["nav-link", {active: this.translateMode == "read"}]} onClick={() => this.translateMode = "read"}>
                        {this.$t("quran-reader.read")}
                    </div>
                </nav>
            </>
        )
    }
})