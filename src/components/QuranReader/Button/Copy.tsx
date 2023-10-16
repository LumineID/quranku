import { ComponentPublicInstance, defineComponent, onMounted, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import Tooltip from "@/components/Tooltip/Tooltip";
import Button from "@/components/Button/Button";
import styles from "./Styles.module.scss";
import toast from "@/lib/toast";
import ClipboardJS from "clipboard";

export default defineComponent({
    props: {
        text: {
            type: String,
            required: true
        }
    },
    setup(props) {
        const trans = useI18n();
        const el = ref<ComponentPublicInstance<HTMLElement> | null>(null);

        onMounted(() => {
            const clipboard = new ClipboardJS(el.value!.$el, { text: () => props.text });

            clipboard.on("success", () => {
                // @ts-ignore
                toast.success(trans.t("general.copied"), {multiple: false})
            });

            onUnmounted(() => clipboard.destroy());
        })

        return { el }
    },
    render() {
        return (
            <>
                <Tooltip tag="div" title={this.$t("general.copy").toLowerCase()}>
                    <Button
                        type="transparent"
                        class={styles.button}
                        ref="el"
                    >
                        <font-awesome-icon icon="copy" class={styles.icon} />
                    </Button>
                </Tooltip>
            </>
        )
    }
})