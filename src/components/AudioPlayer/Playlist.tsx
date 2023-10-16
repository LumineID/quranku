import { Chapters } from "@/types";
import { useAudioPlayer } from "@/hooks/audio-player";
import { useChapters } from "@/hooks/chapters";
import { useToggle } from "@vueuse/core";
import { computed, defineComponent, PropType, ref, Transition } from "vue";
import { AUDIO_PLAYER_START } from "@/event";
import { useTransitionFadeState } from "@/hooks/transition-fade-state";
import formatArabicNumber from "@/helpers/format-arabic-number";
import styles from "./Playlist.module.scss";

type Position = null | "search" | "history";

const PlaylistItems = defineComponent({
    props: {
        items: {
            type: Array as PropType<Chapters[]>,
            required: true
        }
    },
    setup(props) {
        const { audioId } = useAudioPlayer();

        return () => props.items.map(chapter => (
            <div
                key={chapter.id}
                class={[styles.playlist_card_item, {[styles.playlist_card_item_active]: audioId.value === chapter.id}]}
                onClick={() => AUDIO_PLAYER_START.emit(chapter.id)}
            >
                {chapter.name_simple} <span class="ms-1">({formatArabicNumber(chapter.id)})</span>
            </div>
        ))
    }
})

export default defineComponent({
    setup() {
        const [show, toggleShow] = useToggle(false);
        const [transition, setTransition] = useTransitionFadeState<Position>(null);
        const chapters = useChapters();
        const search = ref<string>("");
        const {
            audioId,
            playbackHistory
        } = useAudioPlayer();

        const chapter = computed<Chapters | null>(() => {
            return audioId.value !== null ? chapters.find(audioId.value) : null
        });

        const playlist = computed<Chapters[]>(() => {
            return chapters.search(search.value);
        });

        return {
            chapter,
            playlist,
            search,
            show,
            transition,
            playbackHistory,
            setTransition,
            toggleShow
        }
    },
    render() {
        return (
            <div class={[styles.playlist_container, {[styles.show]: this.show}]}>
                <div class={styles.playlist_title} onClick={() => {
                    this.chapter && this.$router.push({name: "chapter", params: {id: this.chapter.id}});
                }}>
                    {this.chapter && (
                        <span>{this.chapter.name_simple}</span>
                    )}
                </div>
                <div class={styles.flex_center}>
                    <div class={styles.playlist_button_toggle} onClick={() => this.toggleShow()}>
                        <font-awesome-icon icon={this.show ? "xmark" : "list"} class={styles.playlist_button_toggle_icon} />
                    </div>
                </div>
                <div class={[styles.playlist_card, "hide-scrollbar"]}>
                    <Transition
                        enterActiveClass={this.transition.enterClass}
                        leaveActiveClass={this.transition.leaveClass}
                        mode="out-in"
                    >
                        {this.transition.value == null && (
                            <div key={0} style="--animate-duration: .2s">
                                <PlaylistItems items={this.$chapters.data} />
                            </div>
                        )}

                        {this.transition.value == "search" && (
                            <div key={this.transition.value?.toString()} style="--animate-duration: .2s">
                                <div
                                    class={styles.playlist_card_item}
                                    onClick={() => this.setTransition(null, "right")}
                                    data-name="header"
                                >
                                    <font-awesome-icon icon="arrow-left" class="me-2" />
                                    <div>{this.$t("general.find-playlists")}</div>
                                </div>
                                {this.playlist.length == 0 ? (
                                    <div class="text-center font-monospace mt-2">
                                        {this.$t("general.no-playlist-to-display")}
                                    </div>
                                ) : (this.search.trim() == "" ? (
                                    <div class="text-center font-monospace mt-2">
                                        {this.$t("search.type-to-search")}
                                    </div>
                                ) : <PlaylistItems items={this.playlist} />)}
                            </div>
                        )}

                        {this.transition.value == "history" && (
                            <div key={this.transition.value?.toString()} style="--animate-duration: .2s">
                                <div
                                    class={styles.playlist_card_item}
                                    onClick={() => this.setTransition(null, "right")}
                                    data-name="header"
                                >
                                    <font-awesome-icon icon="arrow-left" class="me-2" />
                                    <div>{this.$t("general.playback-history")}</div>
                                </div>
                                {this.playbackHistory.length == 0 ? (
                                    <div class="text-center font-monospace mt-2">
                                        {this.$t("general.no-playback-history")}
                                    </div>
                                ) : <PlaylistItems items={this.playbackHistory.map(item => item.chapter)} />}
                            </div>
                        )}
                    </Transition>
                </div>
                <div class={[styles.playlist_action, "hide-scrollbar"]}>
                    <div
                        class={[styles.playlist_action_button, {[styles.action_button_active]: this.transition.value == "search"}]}
                        onClick={() => this.setTransition("search", "left")}
                    >
                        <font-awesome-icon icon="search" class={styles.playlist_action_button_icon} />
                    </div>
                    <div
                        class={[styles.playlist_action_button, {[styles.action_button_active]: this.transition.value == "history"}]}
                        onClick={() => this.setTransition("history", "left")}
                    >
                        <font-awesome-icon icon="clock-rotate-left" class={styles.playlist_action_button_icon} />
                    </div>
                    {this.transition.value !== null && (
                        <div
                            class={styles.playlist_action_button}
                            onClick={() => this.setTransition(null, "right")}
                        >
                            <font-awesome-icon icon="xmark" class={styles.playlist_action_button_icon} />
                        </div>
                    )}
                </div>
                <Transition
                    enterActiveClass="animate__animated animate__bounceIn"
                    leaveActiveClass="animate__animated animate__fadeOut"
                >
                    {this.transition.value == "search" && (
                        <input
                            class={styles.playlist_search}
                            v-model={this.search}
                            type="search"
                            placeholder={this.$t("general.search")}
                        />
                    )}
                </Transition>
            </div>
        )
    }
})