import { defineComponent, ref, computed, watch, onMounted, nextTick, onBeforeUnmount, Transition, TransitionGroup } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useChapters } from "@/hooks/chapters";
import { useLocalStorage } from "@/hooks/storage";
import { useQuranReader } from "@/hooks/quran-reader";
import { useAudioPlayer } from "@/hooks/audio-player";
import { useHttpRetry, abortSignal } from "@/hooks/http";
import { until, useDebounceFn, useEventListener, useToggle } from "@vueuse/core";
import { useI18n } from "vue-i18n";
import { Chapters } from "@/types";
import { makeUrl } from "@/helpers/api";
import { AudioPlayer } from "@/types";
import { AUDIO_PLAYER_PAUSE, AUDIO_PLAYER_PLAY, AUDIO_PLAYER_START } from "@/event";
import toast from "@/lib/toast";
import styles from "./AudioPlayer.module.scss";
import Range from "../Input/Range";
import formatPlaybackTimer from "@/helpers/format-playback-timer";
import PlaybackController from "./PlaybackController";
import Playlist from "./Playlist";

export default defineComponent({
    setup() {
        const route = useRoute();
        const router = useRouter();
        const chapters = useChapters();
        const trans = useI18n();
        const trackProgress = ref<number>(0);
        const audioData = ref<AudioPlayer["AUDIO_DATA"] | null>(null);
        const audioTrack = ref<any>(null);
        const audio = ref<HTMLAudioElement | null>(null);
        const root = ref<HTMLElement | null>(null);
        const startTime = ref<number>(0);
        const endTime = ref<number>(0);
        const canUpdateSeek = ref<boolean>(true);
        const enableTimeTransition = ref<boolean>(true);
        const [isExpand, toggleExpand] = useToggle(true);
        const [isShowPlaylist, toggleShowPlaylist] = useToggle(false);

        const REQUEST_SIGNAL_ID = "AUDIO_PLAYER_REQUEST_AUDIO";

        const {
            audioId,
            isRepeat,
            isPlaying,
            isAutoScroll,
            currentEvent,
            reciterId,
            playbackSpeed,
            activeTimestamp,
            activeSegment,
            lastAudioTime,
            playingHistory,
            setPlaybackHistory
        } = useAudioPlayer();

        const {
            highlightVerse
        } = useQuranReader();

        const isVisible = computed(() => {
            return audioId.value !== null && audioId.value >= 1;
        });

        const isInCurrentRoute = computed(() => {
            return route.name == "chapter" && String(route.params.id) == String(audioId.value);
        });

        const chapter = computed<Chapters | null>(() => {
            return audioId.value ? chapters.find(audioId.value) : null
        });

        function playAudio() {
            if (audio.value) {
                audio.value.play();
            }
        }

        function pauseAudio() {
            if (audio.value) {
                audio.value.pause();
            }
        }

        function loadAudioData(id: number): Promise<AudioPlayer["AUDIO_DATA"]> {
            return new Promise((resolve, reject) => {
                if (audioData.value?.chapter_id == id && audioData.value?.reciter_id == reciterId.value) {
                    return resolve(audioData.value);
                }

                currentEvent.value = "FETCHING";

                // cancel previous request
                abortSignal.abort(REQUEST_SIGNAL_ID);

                useHttpRetry({config: {params: {segments: true}, signalId: REQUEST_SIGNAL_ID}}).get<{ audio_file: AudioPlayer["AUDIO_DATA"] }>(
                    makeUrl(`chapter_recitations/${reciterId.value}/${id}`)
                ).then(response => {
                    const data = Object.assign(response.data.audio_file, {reciter_id: reciterId.value});
                    audioData.value = data;
                    currentEvent.value = "FETCHED";
                    resolve(data);
                }).catch(e => {
                    if (e?.type?.cancel) {
                        currentEvent.value = "ERROR_REQUEST_CANCEL";
                    } else {
                        currentEvent.value = "ERROR_REQUEST_UNKNOWN";
                        toast.error(trans.t("general.audio-unavailable"));
                    }
                    reject(e);
                })
            })
        }

        function startAudio(id: number, payload?: AudioPlayer["START_AUDIO_PAYLOAD"]) {
            if (id < 1 || id > 114) {
                return payload?.error?.("INVALID_ID");
            }

            audioId.value = id;
            trackProgress.value = 0;
            startTime.value = 0;
            endTime.value = 0;
            highlightVerse.value = null;
            playingHistory.value = null;

            loadAudioData(id).then(data => {
                until(currentEvent).toMatch(value => value === "PLAYING").then(() => {
                    payload?.success?.(data);
                });

                nextTick(() => {
                    if (payload?.startFromAyah) {
                        const time = Number(data.timestamps[payload.startFromAyah-1].timestamp_from / 1000);
                        time === audio.value?.currentTime
                            ? playAudio()
                            : (audio.value!.currentTime = time)
                    } else if (payload?.startFromSeconds && payload.startFromSeconds > 0) {
                        audio.value!.currentTime = payload.startFromSeconds;
                    } else {
                        playAudio();
                    }
                });
            }).catch((e) => {
                payload?.error?.(e);
            })
        }

        function updateHighlightVerse(value: string | null) {
            if (isInCurrentRoute.value) {
                highlightVerse.value = value;
            }
        }

        function setPlayingHistory(time: number, duration: number) {
            playingHistory.value = {
                audioId: audioId.value!,
                reciterId: reciterId.value,
                time: time,
                duration: duration
            }
        }

        const audioEvent = {
            timeupdate(event: Event) {
                const target = (event.target as HTMLAudioElement);
                const time = Math.floor(target.currentTime);
                
                if (canUpdateSeek.value) {
                    trackProgress.value = time;
                    startTime.value = trackProgress.value;
                }
                
                if (time % 5 == 0) {
                    setPlayingHistory(target.currentTime, target.duration)
                }

                if (audioData.value?.timestamps) {
                    activeTimestamp.value = audioData.value.timestamps.find(
                        verse => target.currentTime < Number(verse.timestamp_to / 1000)
                    ) || null;

                    if (activeTimestamp.value) {
                        if (activeTimestamp.value.segments.length == 0) {
                            return updateHighlightVerse(activeTimestamp.value.verse_key);
                        }

                        activeSegment.value = activeTimestamp.value.segments.find(
                            segment => target.currentTime < Number(segment[2] / 1000)
                        ) || null;
                        
                        if (activeSegment.value) {
                            return updateHighlightVerse([activeTimestamp.value.verse_key, activeSegment.value[0]].join(":"))
                        }
                    }
                    updateHighlightVerse(null);
                }
            },
            ended() {
                currentEvent.value = "ENDED";
                playingHistory.value = null;

                if (!audioId.value) {
                    return;
                }

                if (isRepeat.value) {
                    startAudio(audioId.value);
                } else {
                    const id = (audioId.value < 114 ? (audioId.value + 1) : 1);

                    if (isAutoScroll.value && isInCurrentRoute.value) {
                        router.push({name: "chapter", params: { id }});
                    }

                    startAudio(id);
                }
            },
            loadedmetadata(event: Event) {
                const target = (event.target as HTMLAudioElement);
                trackProgress.value = 0;
                startTime.value = 0;
                endTime.value = Math.floor(target.duration);
                target.playbackRate = parseFloat(String(playbackSpeed.value));
                currentEvent.value = "LOADED";
            },
            loadstart() {
                currentEvent.value = "LOADING";
            },
            seeking() {
                canUpdateSeek.value = true;
                currentEvent.value = "SEEKING";
            },
            waiting() {
                currentEvent.value = "WAITING";
            },
            playing() {
                isPlaying.value = true;
                currentEvent.value = "PLAYING";
                setPlaybackHistory(audioId.value!);
            },
            pause() {
                isPlaying.value = false;
                currentEvent.value = "PAUSE";
            },
            seeked: useDebounceFn((event: Event) => {
                const target = (event.target as HTMLAudioElement);
                enableTimeTransition.value = true;
                currentEvent.value = "SEEKED";
                setPlayingHistory(target.currentTime, target.duration);
                setTimeout(playAudio, 200);
            }, 500),
            error: useDebounceFn(() => {
                toast.error(trans.t("general.cant-play-audio"));
                isPlaying.value = false;
                currentEvent.value = "ERROR";
            }, 500)
        }

        let startPointerValue: number = 0;

        const audioTrackEvent = {
            change(event: Event) {
                if (audio.value) {
                    audio.value.currentTime = Number((event.target as HTMLInputElement).value)
                }
            },
            pointerdown(event: Event) {
                canUpdateSeek.value = false;
                enableTimeTransition.value = false;
                startPointerValue = Number((event.target as HTMLInputElement).value);
            },
            pointerup(event: Event) {
                if (startPointerValue == Number((event.target as HTMLInputElement).value)) {
                    canUpdateSeek.value = true;
                    enableTimeTransition.value = true;
                }
            },
            input(event: Event) {
                startTime.value = Number((event.target as HTMLInputElement).value)
            }
        }

        onMounted(() => {
            AUDIO_PLAYER_PLAY.on(playAudio);
            AUDIO_PLAYER_PAUSE.on(pauseAudio);
            AUDIO_PLAYER_START.on(startAudio);
        });

        onBeforeUnmount(() => {
            AUDIO_PLAYER_PLAY.off(playAudio);
            AUDIO_PLAYER_PAUSE.off(pauseAudio);
            AUDIO_PLAYER_START.off(startAudio);
        });

        watch(audioId, pauseAudio);
        watch(reciterId, () => audioId.value && loadAudioData(audioId.value).then(playAudio));

        watch(playbackSpeed, (speed) => {
            if (audio.value) {
                audio.value.playbackRate = parseFloat(String(speed));
            }
        });

        watch(isVisible, (isVisible) => {
            if (isVisible) {
                nextTick(() => {
                    Object.keys(audioEvent).forEach((eventName: string) => {
                        useEventListener(audio, eventName, audioEvent[eventName as keyof typeof audioEvent]);
                    });
    
                    Object.keys(audioTrackEvent).forEach((eventName: string) => {
                        audioTrack.value!.addEvent(
                            eventName,
                            audioTrackEvent[eventName as keyof typeof audioTrackEvent]
                        );
                    });
                })
            } else {
                highlightVerse.value = null;
                activeTimestamp.value = null;
                lastAudioTime.value = {time: audio.value?.currentTime || 0, audioId: Number(root.value?.dataset?.audioId || 0)}
            }
        }, {immediate: true});

        watch(isExpand, (isExpand) => {
            if (root.value) {
                const controllerEl = root.value.querySelector(`.${styles.playback_controller}`);
                if (controllerEl) {
                    const height = (controllerEl as HTMLElement).offsetHeight;
                    root.value.setAttribute("style", `transform: translateY(${isExpand ? 0 : height + 35}px)`);
                    root.value.classList.add(styles.transition_5s);
                    setTimeout(() => {
                        root.value!.classList.remove(styles.transition_5s);
                    }, 500);
                }
            }
        });

        return {
            root,
            isVisible,
            isExpand,
            isShowPlaylist,
            trackProgress,
            currentEvent,
            startTime,
            endTime,
            enableTimeTransition,
            audioData,
            audio,
            audioId,
            audioTrack,
            chapter,
            canUpdateSeek,
            startAudio,
            toggleExpand,
            toggleShowPlaylist
        }
    },
    render() {
        return (
            <>
                <Transition
                    enterActiveClass="animate__animated animate__fadeInUpBig"
                    leaveActiveClass="animate__animated animate__fadeOutDownBig"
                >
                    {this.isVisible && (
                        <div
                            class={styles.playback_container}
                            data-is-expand={this.isExpand}
                            data-audio-id={this.audioId}
                            ref="root"
                        >
                            <div class={styles.playback_wrapper}>
                                <div class={styles.playback_card}>
                                    <div class={styles.playback_header}>
                                        <Playlist />

                                        <div class={styles.playback_visible_button} onClick={() => this.toggleExpand()}>
                                            <font-awesome-icon icon={this.isExpand ? "caret-up" : "caret-down"} class={styles.playback_visible_button_icon} />
                                        </div>
                                    </div>
                                    <div class={styles.playback_controller}>
                                        <Range
                                            v-model={this.trackProgress}
                                            max={this.endTime}
                                            disabled={this.currentEvent !== null && ["LOADING", "FETCHING", "ERROR"].includes(this.currentEvent)}
                                            canUpdateBeforeWidth={this.canUpdateSeek}
                                            ref="audioTrack"
                                        />
                                        <div class="d-flex justify-content-between">
                                            <div class="d-flex">
                                                <TransitionGroup
                                                    css={this.enableTimeTransition}
                                                    enterActiveClass={styles.transition_time_enter}
                                                    leaveActiveClass={styles.transition_time_leave}
                                                    enterFromClass={styles.transition_time_from_to}
                                                    leaveToClass={styles.transition_time_from_to}
                                                >
                                                    {formatPlaybackTimer(this.startTime).split("").map((value, index) => (
                                                        <span key={[value, index].toString()}>{value}</span>
                                                    ))}
                                                </TransitionGroup>
                                            </div>
                                            <div class="d-flex">
                                                <TransitionGroup
                                                    css={this.enableTimeTransition}
                                                    enterActiveClass={styles.transition_time_enter}
                                                    leaveActiveClass={styles.transition_time_leave}
                                                    enterFromClass={styles.transition_time_from_to}
                                                    leaveToClass={styles.transition_time_from_to}
                                                >
                                                    {formatPlaybackTimer(this.endTime).split("").map((value, index) => (
                                                        <span key={[value, index].toString()}>{value}</span>
                                                    ))}
                                                </TransitionGroup>
                                            </div>
                                        </div>
                                        
                                        <PlaybackController />
                                    </div>
                                </div>
                            </div>
                            <audio
                                style={{ display: "none", visibility: "hidden" }}
                                ref="audio"
                                preload="metadata"
                                src={this.audioData?.audio_url}
                            />
                        </div>
                    )}
                </Transition>
            </>
        )
    }
})