import { defineComponent, computed } from "vue";
import { useLocalStorage } from "@/hooks/storage";
import { useI18n } from "vue-i18n";
import Tooltip from "@/components/Tooltip/Tooltip";
import Button from "@/components/Button/Button";
import styles from "./Styles.module.scss";
import toast from "@/lib/toast";

export default defineComponent({
    props: {
        verseKey: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        }
    },
    setup(props) {
        const storage = useLocalStorage();
        const trans = useI18n();

        const isBookmarked = computed<boolean>(() => {
            return Object.keys(storage.get("BOOKMARK", {})).includes(props.verseKey)
        });

        function click() {
            storage.set("BOOKMARK", (bookmark: Record<string, number> = {}) => {
                if (bookmark[props.verseKey] == undefined) {
                    const value = Object.values(bookmark);
                    bookmark[props.verseKey] = value.length > 0 ? (Math.max(...value) + 1) : 1;
                    toast.success(
                        trans.t("quran-reader.has-marked-verse", {surah: props.name, ayah: props.verseKey.split(":").pop()}
                    ))
                } else {
                    delete bookmark[props.verseKey]
                }
                return bookmark;
            })
        }

        return {
            click,
            isBookmarked
        }
    },
    render() {
        return (
            <>
                <Tooltip tag="div" title={this.$t("general.bookmark").toLowerCase()}>
                    <Button
                        type="transparent"
                        class={styles.button}
                        onClick={this.click}
                    >
                        <font-awesome-icon icon="bookmark" class={[styles.icon, {"text-primary": this.isBookmarked}]} />
                    </Button>
                </Tooltip>
            </>
        )
    }
})