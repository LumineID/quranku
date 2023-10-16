import { useEventBus } from "@vueuse/core";
import { AudioPlayer } from "./types";

export const AUDIO_PLAYER_PLAY = useEventBus("AUDIO_PLAYER_PLAY");
export const AUDIO_PLAYER_PAUSE = useEventBus("AUDIO_PLAYER_PAUSE");
export const AUDIO_PLAYER_START = useEventBus<number, AudioPlayer["START_AUDIO_PAYLOAD"]>("AUDIO_PLAYER_START");