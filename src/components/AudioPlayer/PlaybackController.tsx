import { defineComponent, computed, Transition, ref, watch } from "vue";
import { useAudioPlayer } from "@/hooks/audio-player";
import { AUDIO_PLAYER_PLAY, AUDIO_PLAYER_PAUSE, AUDIO_PLAYER_START } from "@/event";
import { useChapters } from "@/hooks/chapters";
import { Chapters, Reciters } from "@/types";
import { useHttp, abortSignal, useHttpRetry } from "@/hooks/http";
import { useI18n } from "vue-i18n";
import { makeUrl } from "@/helpers/api";
import { useTransitionFadeState } from "@/hooks/transition-fade-state";
import toast from "@/lib/toast";
import styles from "./PlaybackController.module.scss";
import collect from "collect.js";
import Dropdown from "@/components/Dropdown/Dropdown";
import Checkbox from "@/components/Input/Checkbox";

type Position = null | "download" | "reciter" | "setting" | "speed";

type DownloadState = Record<number, {
    signal: string
    filename: string
    isDownloading: boolean
    disableCancelButton: boolean
}>

const SPEED: Array<[number, string]> = [
    [0.25, "0,25"],
    [0.5, "0,5"],
    [0.75, "0,75"],
    [1, "Normal"],
    [1.25, "1,25"],
    [1.5, "1,5"],
    [1.75, "1,75"],
    [2, "2"],
];

export default defineComponent({
    emits: ["play", "pause"],
    setup() {
        const {
            audioId,
            reciterId,
            isPlaying,
            isRepeat,
            isAutoScroll,
            isShowTooltip,
            playbackSpeed,
            currentEvent,
            lastAudioTime
        } = useAudioPlayer();

        const chapters = useChapters();
        const trans = useI18n();
        const downloadState = ref<DownloadState>({});
        const isFetchingReciter = ref<boolean>(false);
        const reciters = ref<Reciters[]>([]);
        const [position, setPosition] = useTransitionFadeState<Position>(null);

        const chapter = computed<Chapters | null>(() => {
            return audioId.value ? chapters.find(audioId.value) : null;
        });

        const isLoading = computed<boolean>(() => {
            return currentEvent.value !== null && ["FETCHING", "SEEKING", "WAITING", "LOADING"].includes(currentEvent.value);
        });

        const isDownloading = computed<boolean>(() => {
            return chapter.value !== null && downloadState.value[chapter.value.id]?.isDownloading === true;
        });

        const handler = {
            repeat() {
                isRepeat.value = !isRepeat.value;
            },
            play() {
                if (isPlaying.value) {
                    AUDIO_PLAYER_PAUSE.emit();
                    isPlaying.value = false;
                } else {
                    AUDIO_PLAYER_PLAY.emit();
                    isPlaying.value = true;
                }
            },
            previous() {
                if (audioId.value) {
                    start(audioId.value <= 1 ? 114 : audioId.value - 1);
                }
            },
            next() {
                if (audioId.value) {
                    start(audioId.value >= 114 ? 1 : audioId.value + 1);
                }
            }
        }

        function start(audioId: number) {
            AUDIO_PLAYER_START.emit(audioId, {
                startFromSeconds: lastAudioTime.value?.audioId === audioId ? lastAudioTime.value.time : 0
            });
        }

        function redirectDownloadLink(link: string, filename: string = "audio") {
            const el = document.createElement("a");
            el.classList.add("d-none");
            el.setAttribute("download",`${filename}.mp3`);
            el.setAttribute("target", "_blank");
            el.setAttribute("href",  link);
            document.body.appendChild(el);
            el.click();
            document.body.removeChild(el);
        }

        function downloadAudio() {
            if (chapter.value == null) {
                return console.warn("missing audio id");
            }

            const id = chapter.value.id;
            const signal = ["auto-abort-false", [id, Date.now()].map(String).join("")].join(":");

            const http = useHttp({
                signalId: signal,
                responseType: "blob",
                beforeRequest() {
                    downloadState.value[id] = {
                        signal: signal,
                        filename: chapter.value!.name_simple,
                        isDownloading: true,
                        disableCancelButton: false
                    }
                },
                afterRequest() {
                    setTimeout(() => {
                        if (downloadState.value[id]) {
                            delete downloadState.value[id];
                        }
                    }, 1000)
                }
            });

            http.get(`https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/${id}.mp3`).then(response => {
                redirectDownloadLink(
                    window.URL.createObjectURL(response.data),
                    downloadState.value[id].filename
                );
                toast.success(trans.t("general.audio-has-ben-downloaded"));
            }).catch(e => {
                toast.error(e.type?.cancel ? trans.t("general.downloading-has-ben-canceled") : (e._message || e.toString()))
            })
        }

        function cancelDownload(id: number) {
            toast.confirm(trans.t("general.canceling-download"), {
                autoClose: 2000,
                onOpen() {
                    if (downloadState.value[id]) {
                        downloadState.value[id].disableCancelButton = true;
                    }
                }
            }).then(({ isConfirmed }) => {
                if (isConfirmed && downloadState.value[id]) {
                    abortSignal.abort(downloadState.value[id].signal);
                } else {
                    downloadState.value[id].disableCancelButton = false;
                }
            })
        }

        watch(() => position.value.value, (position) => {
            if (position !== "reciter" || isFetchingReciter.value) {
                return;
            }

            if (reciters.value.length) {
                isFetchingReciter.value = false;
                return;
            }

            useHttpRetry({config: {
                beforeRequest() {
                    isFetchingReciter.value = true
                },
                afterRequest() {
                    isFetchingReciter.value = false
                }
            }}).get<{ recitations: Reciters[] }>(makeUrl("/resources/recitations?language=en")).then(response => {
                reciters.value = collect(response.data.recitations).sortByDesc((row: Reciters) => row.id == 7).toArray();
            })
        })

        return {
            isRepeat,
            reciterId,
            isLoading,
            isPlaying,
            isDownloading,
            isFetchingReciter,
            isAutoScroll,
            isShowTooltip,
            playbackSpeed,
            audioId,
            currentEvent,
            chapter,
            handler,
            position,
            reciters,
            downloadState,
            setPosition,
            redirectDownloadLink,
            downloadAudio,
            cancelDownload
        }
    },
    render() {
        return (
            <>
                <div class="d-flex justify-content-between justify-content-md-center align-items-center">
                    <div
                        class={[styles.playback_control_button, {[styles.control_button_active]: this.isRepeat}]}
                        onClick={this.handler.repeat}
                    >
                        <font-awesome-icon icon="repeat" class={styles.control_button_icon} />
                    </div>
                    <div
                        class={styles.playback_control_button}
                        onClick={this.handler.previous}
                    >
                        <font-awesome-icon icon="backward" class={styles.control_button_icon} />
                    </div>
                    {this.isLoading ? (
                        <div class={styles.playback_control_button}>
                            <font-awesome-icon icon="spinner" class={styles.control_button_icon} style={{ animationDuration: "1.2s" }} spin />
                        </div>
                    ) : (
                        <div
                            class={[styles.playback_control_button, {[styles.control_button_disabled]: this.currentEvent === "ERROR"}]}
                            onClick={this.handler.play}
                        >
                            <font-awesome-icon icon={this.isPlaying ? "circle-pause" : "circle-play"} class={styles.control_button_icon} />
                        </div>
                    )}
                    <div
                        class={styles.playback_control_button}
                        onClick={this.handler.next}
                    >
                        <font-awesome-icon icon="forward" class={styles.control_button_icon} />
                    </div>
                    <div
                        class={styles.playback_control_button}
                    >
                        <Dropdown
                            options={{ autoClose: "outside" }}
                            menuClasses="w-300-px max-h-400-px overflow-x-hidden custom-scrollbar"
                        >
                            {{
                                button: () => (
                                    <div class="w-40-px h-40-px d-flex align-items-center">
                                        <font-awesome-icon icon="ellipsis-vertical" class={[styles.control_button_icon, "d-flex mx-auto"]} />
                                    </div>
                                ),
                                default: () => (
                                    <Transition
                                        enterActiveClass={this.position.enterClass}
                                        leaveActiveClass={this.position.leaveClass}
                                        mode="out-in"
                                    >
                                        {this.position.value == null && (
                                            <div key={1} style="--animate-duration: .2s">
                                                {this.chapter !== null && (
                                                    <div
                                                        class="dropdown-item d-flex justify-content-between"
                                                        onClick={() => this.setPosition("download", "left")}
                                                    >
                                                        <div>
                                                            <font-awesome-icon icon="download" class="me-2 min-w-17-px" /> {this.$t("audio-player.playback-options.download.label")}
                                                        </div>
                                                        <div>
                                                            <font-awesome-icon icon="caret-right" />
                                                        </div>
                                                    </div>
                                                )}
                                                <div
                                                    class="dropdown-item d-flex justify-content-between"
                                                    onClick={() => this.setPosition("reciter", "left")}
                                                >
                                                    <div>
                                                        <font-awesome-icon icon="user" class="me-2 min-w-17-px" /> {this.$t("audio-player.playback-options.reciter.label")}
                                                    </div>
                                                    <div>
                                                        <font-awesome-icon icon="caret-right" />
                                                    </div>
                                                </div>
                                                <div
                                                    class="dropdown-item d-flex justify-content-between"
                                                    onClick={() => this.setPosition("setting", "left")}
                                                >
                                                    <div>
                                                        <font-awesome-icon icon="cog" class="me-2 min-w-17-px" /> {this.$t("audio-player.playback-options.setting.label")}
                                                    </div>
                                                    <div>
                                                        <font-awesome-icon icon="caret-right" />
                                                    </div>
                                                </div>
                                                <div
                                                    class="dropdown-item d-flex justify-content-between"
                                                    onClick={() => this.setPosition("speed", "left")}
                                                >
                                                    <div>
                                                        <font-awesome-icon icon="bolt" class="me-2 min-w-17-px" />
                                                        <span class="ms-1">{this.$t("audio-player.playback-options.speed.label")} <strong>.</strong> <small class="fw-bold me-2 min-w-17-px d-inline-block text-center" style="font-size: 12px">
                                                            {parseFloat(String(this.playbackSpeed))}x
                                                        </small></span>
                                                    </div>
                                                    <div>
                                                        <font-awesome-icon icon="caret-right" />
                                                    </div>
                                                </div>
                                                <div
                                                    class="dropdown-item"
                                                    onClick={() => this.audioId = null}
                                                >
                                                    <font-awesome-icon icon="xmark" class="me-2 min-w-17-px" /> {this.$t("audio-player.playback-options.close-audio")}
                                                </div>
                                            </div>
                                        )}

                                        {this.position.value == "download" && (
                                            <div key={2} style="--animate-duration: .2s">
                                                <div class="dropdown-item border-bottom pb-2" onClick={() => this.setPosition(null, "right")}>
                                                    <font-awesome-icon icon="arrow-left" class="me-2 min-w-17-px" /> {this.$t("audio-player.playback-options.download.title")}
                                                </div>
                                                <div
                                                    class={["dropdown-item", {disabled: this.audioId !== null && this.downloadState[this.audioId]?.disableCancelButton === true}]}
                                                    onClick={() => {
                                                        if (this.isDownloading) {
                                                            this.cancelDownload(this.chapter!.id)
                                                        } else {
                                                            this.downloadAudio();
                                                        }
                                                    }}
                                                >
                                                    {this.isDownloading ? (
                                                        <>
                                                            <font-awesome-icon icon="spinner" class="me-2 min-w-17-px" spin /> {this.$t("audio-player.playback-options.download.cancel")}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <font-awesome-icon icon="download" class="me-2 min-w-17-px" />  {this.$t("audio-player.playback-options.download.auto")}
                                                        </>
                                                    )}
                                                </div>
                                                <div
                                                    class="dropdown-item"
                                                    onClick={
                                                        () => this.redirectDownloadLink(`https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/${this.audioId}.mp3`, this.chapter?.name_simple)
                                                    }
                                                >
                                                    <font-awesome-icon icon="link" class="me-2 w-17-px" /> {this.$t("audio-player.playback-options.download.manual")}
                                                </div>
                                            </div>
                                        )}

                                        {this.position.value == "reciter" && (
                                            <div key={3} style="--animate-duration: .2s">
                                                <div class="dropdown-item border-bottom pb-2" onClick={() => this.setPosition(null, "right")}>
                                                    <font-awesome-icon icon="arrow-left" class="me-2 min-w-17-px" /> {this.$t("audio-player.playback-options.reciter.title")}
                                                </div>
                                                {this.isFetchingReciter ? (
                                                    <div class="dropdown-item d-flex justify-content-center">
                                                        <font-awesome-icon icon="spinner" size="2x" spin />
                                                    </div>
                                                ) : (
                                                    this.reciters.map(reciter => (
                                                        <div
                                                            key={reciter.id}
                                                            class="dropdown-item d-flex align-items-center"
                                                            onClick={() => this.reciterId = reciter.id}
                                                        >
                                                            <div class="me-2 min-w-17-px">
                                                                {this.reciterId === reciter.id && (
                                                                    <font-awesome-icon icon="check" />
                                                                )}
                                                            </div>
                                                            <div class="text-wrap">
                                                                <span>{reciter.reciter_name} {reciter.style && (
                                                                    <span class="ms-1 fw-bold">({reciter.style})</span>
                                                                )}</span>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}

                                        {this.position.value == "setting" && (
                                            <div key={4} style="--animate-duration: .2s">
                                                <div class="dropdown-item border-bottom pb-2" onClick={() => this.setPosition(null, "right")}>
                                                    <font-awesome-icon icon="arrow-left" class="me-2 min-w-17-px" /> {this.$t("audio-player.playback-options.setting.title")}
                                                </div>
                                                <div class="dropdown-item">
                                                    <Checkbox
                                                        v-model={this.isAutoScroll}
                                                        labelClasses="ms-2 cursor-pointer text-wrap"
                                                        label={this.$t("audio-player.playback-options.setting.scroll")}
                                                    />
                                                </div>
                                                <div class="dropdown-item">
                                                    <Checkbox
                                                        v-model={this.isShowTooltip}
                                                        labelClasses="ms-2 cursor-pointer text-wrap"
                                                        label={this.$t("audio-player.playback-options.setting.tooltip")}
                                                        disabled={(!this.$setting.translation && !this.$setting.transliteration) || (!this.$setting.translationDisplay.tooltip && !this.$setting.transliterationDisplay.tooltip)}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {this.position.value == "speed" && (
                                            <div key={5} style="--animate-duration: .2s">
                                                <div class="dropdown-item border-bottom pb-2" onClick={() => this.setPosition(null, "right")}>
                                                    <font-awesome-icon icon="arrow-left" class="me-2 min-w-17-px" /> {this.$t("audio-player.playback-options.speed.title")}
                                                </div>
                                                {SPEED.map((speed, key) => (
                                                    <div
                                                        key={key}
                                                        class="dropdown-item d-flex align-items-center"
                                                        onClick={() => this.playbackSpeed = (speed[0] as any)}
                                                    >
                                                        <div class="me-2 min-w-17-px">
                                                            {speed[0] === this.playbackSpeed && (
                                                                <font-awesome-icon icon="check" />
                                                            )}
                                                        </div>
                                                        <div class="text-wrap">
                                                            <span>{speed[1]}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </Transition>
                                )
                            }}
                        </Dropdown>
                    </div>
                </div>
            </>
        )
    }
})