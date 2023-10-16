import { useLocalStorage } from "./storage";
import { createGlobalState } from "@vueuse/core";
import { computed, ref, Ref, WritableComputedRef } from "vue";
import { AudioPlayer, Chapters } from "@/types";
import { useChapters } from "./chapters";
import collect from "collect.js";

export type PlaybackSpeed = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;
export type PlaybackHistory = {
    chapter: Chapters
    timestamp: number
}
export type PlayingHistory = {
    audioId: number
    reciterId: number
    time: number
    duration: number
}
export type LastAudioTime = {
    audioId: number
    time: number
}
export type ActiveSegment = [
    number,
    number,
    number
]
export type CurrentEvent =
    | "FETCHING"
    | "FETCHED"
    | "LOADING"
    | "SEEKING"
    | "SEEKED"
    | "ERROR"
    | "ENDED"
    | "LOADED"
    | "PAUSE"
    | "WAITING"
    | "PLAYING"
    | "ERROR_REQUEST_CANCEL"
    | "ERROR_REQUEST_UNKNOWN"

export interface UseAudioPlayer {
    audioId: Ref<number | null>
    isPlaying: Ref<boolean>
    currentEvent: Ref<CurrentEvent | null>
    activeTimestamp: Ref<AudioPlayer["TIMESTAMP"] | null>
    lastAudioTime: Ref<LastAudioTime | null>
    activeSegment: Ref<ActiveSegment | null>
    isAutoScroll: WritableComputedRef<boolean>
    isShowTooltip: WritableComputedRef<boolean>
    isRepeat: WritableComputedRef<boolean>
    reciterId: WritableComputedRef<number>
    playbackSpeed: WritableComputedRef<PlaybackSpeed>
    playbackHistory: WritableComputedRef<PlaybackHistory[]>
    playingHistory: WritableComputedRef<PlayingHistory | null>
    setPlaybackHistory: (audioId: number) => void
}

export const useAudioPlayer = createGlobalState<() => UseAudioPlayer>((): UseAudioPlayer => {
    const storage = useLocalStorage();
    const chapters = useChapters();
    const audioId = ref<number | null>(null);
    const isPlaying = ref<boolean>(false);
    const currentEvent = ref<CurrentEvent | null>(null);
    const activeTimestamp = ref<AudioPlayer["TIMESTAMP"] | null>(null);
    const lastAudioTime = ref<LastAudioTime | null>(null);
    const activeSegment = ref<ActiveSegment | null>(null);

    const isAutoScroll = computed<boolean>({
        set(value) {
            storage.set("AUDIO_PLAYER:AUTO_SCROLL", value);
        },
        get() {
            return storage.get("AUDIO_PLAYER:AUTO_SCROLL", true);
        }
    });

    const isShowTooltip = computed<boolean>({
        set(value) {
            storage.set("AUDIO_PLAYER:SHOW_TOOLTIP", value);
        },
        get() {
            return storage.get("AUDIO_PLAYER:SHOW_TOOLTIP", true);
        }
    });

    const isRepeat = computed<boolean>({
        set(value) {
            storage.set("AUDIO_PLAYER:REPEAT", value);
        },
        get() {
            return storage.get("AUDIO_PLAYER:REPEAT", false);
        }
    });

    const reciterId = computed<number>({
        set(value) {
            storage.set("AUDIO_PLAYER:RECITER_ID", value);
        },
        get() {
            return storage.get("AUDIO_PLAYER:RECITER_ID", 7);
        }
    });

    const playbackSpeed = computed<PlaybackSpeed>({
        set(value) {
            storage.set("AUDIO_PLAYER:SPEED", value);
        },
        get() {
            return storage.get("AUDIO_PLAYER:SPEED", 1);
        }
    });

    const playingHistory = computed<PlayingHistory | null>({
        set(value) {
            storage.set("AUDIO_PLAYER:PLAYING_HISTORY", value);
        },
        get() {
            return storage.get("AUDIO_PLAYER:PLAYING_HISTORY", null);
        }
    })

    const playbackHistory = computed<PlaybackHistory[]>(() => {
        const history = Array.from(storage.get("AUDIO_PLAYER:PLAYBACK_HISTORY", [])).map((item: any) => {
            let chapter = null;
            if (
                (typeof item == "object" && item !== null && !Array.isArray(item)) &&
                typeof item.id == "number"                                         &&
                typeof item.timestamp == "number"                                  &&
                (chapter = chapters.find(item.id))
            ) {
                return {chapter, timestamp: item.timestamp}
            } else {
                return null;
            }
        }).filter(item => item !== null) as PlaybackHistory[];

        return collect(history)
            .sortByDesc((item: any) => item.timestamp)
            .unique((item: any) => item.chapter.id)
            .take(5)
            .toArray();
    });

    function setPlaybackHistory(audioId: number) {
        const history = Array.from(storage.get("AUDIO_PLAYER:PLAYBACK_HISTORY", []));
            
        history.push({id: audioId, timestamp: Number((new Date).getTime() / 1000)});

        storage.set("AUDIO_PLAYER:PLAYBACK_HISTORY", collect(history)
            .sortByDesc((item: any) => item.timestamp)
            .unique("id")
            .take(5)
            .toArray()
        )
    }

    return {
        audioId,
        isPlaying,
        isAutoScroll,
        isShowTooltip,
        isRepeat,
        reciterId,
        currentEvent,
        playbackSpeed,
        activeTimestamp,
        activeSegment,
        lastAudioTime,
        playbackHistory,
        playingHistory,
        setPlaybackHistory
    }
});