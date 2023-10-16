import { defineComponent, computed, ref } from "vue";
import { useAudioPlayer } from "@/hooks/audio-player";
import { AUDIO_PLAYER_START } from "@/event";
import Tooltip from "@/components/Tooltip/Tooltip";
import Button from "@/components/Button/Button";
import styles from "./Styles.module.scss";

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
        const { audioId, currentEvent } = useAudioPlayer();

        const isLoading = ref<boolean>(false);

        const isDisabled = computed<boolean>(() => {
            return audioId.value == props.chapterId && currentEvent.value !== null && [
                "ERROR",
                "FETCHING",
                "SEEKING",
                "WAITING",
                "LOADING"
            ].includes(currentEvent.value);
        });

        function click() {
            isLoading.value = true;
            AUDIO_PLAYER_START.emit(props.chapterId, {
                startFromAyah: props.verseNumber,
                success: () => isLoading.value = false,
                error: () => isLoading.value = false
            });
        }

        return {
            click,
            isDisabled,
            isLoading
        }
    },
    render() {
        return (
            <>
                <Tooltip tag="div" title={this.$t("audio-player.play").toLowerCase()}>
                    <Button
                        type="transparent"
                        class={styles.button}
                        onClick={this.click}
                        disabled={this.isDisabled}
                    >
                        <font-awesome-icon
                            icon={this.isLoading ? "spinner" : "play"}
                            spin={this.isLoading}
                            class={styles.icon}
                        />
                    </Button>
                </Tooltip>
            </>
        )
    }
})