import { useAudioPlayer } from "@/hooks/audio-player";
import { defineComponent, computed } from "vue";
import { AUDIO_PLAYER_START, AUDIO_PLAYER_PAUSE, AUDIO_PLAYER_PLAY } from "@/event";
import { useAlert } from "@/lib/alert";
import { useI18n } from "vue-i18n";
import { useChapters } from "@/hooks/chapters";
import Button from "../Button/Button";
import formatPlaybackTimer from "@/helpers/format-playback-timer";

export default defineComponent({
    props: {
        audioId: {
            type: Number,
            required: true
        }
    },
    setup(props) {
        const dialog = useAlert();
        const trans = useI18n();
        const chapters = useChapters();
        const {
            audioId,
            reciterId,
            isPlaying,
            currentEvent,
            lastAudioTime,
            playingHistory
        } = useAudioPlayer();

        const isOnCurrentAudioId = computed<boolean>(() => {
            return audioId.value === props.audioId;
        });

        const isLoading = computed<boolean>(() => {
            return isOnCurrentAudioId.value && currentEvent.value !== null && ["FETCHING", "SEEKING", "WAITING", "LOADING"].includes(currentEvent.value);
        });

        const isAudioPlaying = computed<boolean>(() => {
            return isOnCurrentAudioId.value && isPlaying.value && !isLoading.value
        });

        async function togglePlay() {
            if (isAudioPlaying.value) {
                return AUDIO_PLAYER_PAUSE.emit();
            }

            if (isOnCurrentAudioId.value) {
                return AUDIO_PLAYER_PLAY.emit();
            }

            if (lastAudioTime.value?.audioId === props.audioId) {
                return AUDIO_PLAYER_START.emit(props.audioId, {
                    startFromSeconds: lastAudioTime.value.time
                });
            }

            if (playingHistory.value) {
                if (playingHistory.value.audioId === props.audioId && playingHistory.value.reciterId === reciterId.value) {
                    if (Math.floor(playingHistory.value.time) > 0 && Math.floor(playingHistory.value.time) < Math.floor(playingHistory.value.duration)) {
                        const chapter = chapters.find(playingHistory.value.audioId);
                        const { context: { isConfirmed } } = await dialog.confirm(trans.t("audio-player.resume-playing-dialog", {
                            name: chapter?.name_simple,
                            time: formatPlaybackTimer(playingHistory.value.time),
                            duration: formatPlaybackTimer(playingHistory.value.duration)
                        }), {
                            title: chapter?.name_simple,
                            cancelText: trans.t("general.no")
                        });

                        if (isConfirmed) {
                            return AUDIO_PLAYER_START.emit(playingHistory.value.audioId, {
                                startFromSeconds: playingHistory.value.time
                            })
                        } else {
                            playingHistory.value = null;
                        }
                    }
                }
            }

            AUDIO_PLAYER_START.emit(props.audioId);
        }

        return {
            isLoading,
            isAudioPlaying,
            togglePlay
        }
    },
    render() {
        return (
            <Button
                type="primary"
                size="sm"
                class="w-100 h-100"
                disabled={this.isLoading}
                onClick={this.togglePlay}
            >
                {this.isAudioPlaying ? (
                    <>
                        <font-awesome-icon icon="circle-pause" class="me-1" />
                        <span>{this.$t("audio-player.pause-btn")}</span>
                    </>
                ) : (
                    <>
                        <font-awesome-icon icon={this.isLoading ? "spinner" : "circle-play"} spin={this.isLoading} class="me-1" />
                        <span>{this.$t("audio-player.play-btn")}</span>
                    </>
                )}
            </Button>
        )
    }
})