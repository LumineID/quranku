import { ref, Ref, nextTick } from "vue";

export type Animation = "left" | "right";
export type State<T> = {
    value: T
    enterClass: string
    leaveClass: string
}
export type UseTransitionFadeStateReturn<T> = [state: Ref<State<T>>, setState: (value: T, animation: Animation) => void]

export function useTransitionFadeState<T = any>(initialValue: T): UseTransitionFadeStateReturn<T> {
    const state = ref<State<T>>({
        value: initialValue,
        enterClass: "animate__animated animate__fadeIn",
        leaveClass: "animate__animated animate__fadeOut"
    });

    return [state, (value: T, animation: Animation) => {
        state.value.enterClass = `animate__animated animate__${animation == "right" ? "fadeInLeft" : "fadeInRight"}`;
        state.value.leaveClass = `animate__animated animate__${animation == "right" ? "fadeOutLeft" : "fadeOutRight"}`;
        nextTick(() => {
            // @ts-ignore
            state.value.value = value;
        })
    }] as UseTransitionFadeStateReturn<T>
}