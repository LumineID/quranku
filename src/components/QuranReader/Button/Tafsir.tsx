import { defineComponent } from "vue";
import { useQuranReader } from "@/hooks/quran-reader";
import Tooltip from "@/components/Tooltip/Tooltip";
import Button from "@/components/Button/Button";
import styles from "./Styles.module.scss"

export default defineComponent({
    props: {
        chapterId: {
            type: Number,
            required: true
        },
        verseNumber: {
            type: Number,
            required: true
        }
    },
    setup(props) {
        const { tafsirModal } = useQuranReader();

        function click() {
            tafsirModal.value = {
                isOpen: true,
                chapterId: props.chapterId,
                verseNumber: props.verseNumber
            }
        }

        return { click }
    },
    render() {
        return (
            <>
                <Tooltip tag="div" title={this.$t("general.tafsir").toLowerCase()}>
                    <Button
                        type="transparent"
                        class={styles.button}
                        onClick={this.click}
                    >
                        <font-awesome-icon icon="book-open" class={styles.icon} />
                    </Button>
                </Tooltip>
            </>
        )
    }
})