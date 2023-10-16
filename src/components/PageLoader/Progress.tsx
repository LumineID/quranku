import { defineComponent, ref, watch, onUnmounted } from "vue";
import random from "lodash.random";
import styles from "./Progress.module.scss";
import scroll from "@/helpers/scroll";

export default defineComponent({
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        defaultDuration: {
            type: Number,
            default: 8000
        },
        defaultInterval: {
            type: Number,
            default: 40
        },
        variation: {
            type: Number,
            default: 0.5
        },
        startingPoint: {
            type: Number,
            default: 0
        },
        endingPoint: {
            type: Number,
            default: 90
        }
    },
    setup(props) {
        const progress = ref<number>(0);
        const showProgress = ref<boolean>(false);
        const timeoutId = ref<ReturnType<typeof setTimeout> | null>(null);

        function start() {
            progress.value = props.startingPoint;
            showProgress.value = true;
            scroll.disable();
            loop();
        }

        function stop() {
            timeoutId.value !== null && clearTimeout(timeoutId.value);
            progress.value = 100;
            timeoutId.value = null;
            scroll.enable();
            setTimeout(() => {
                showProgress.value = false;
            }, 500)
        }

        function loop() {
            if (timeoutId.value !== null) {
                clearTimeout(timeoutId.value);
            }
            if (progress.value >= props.endingPoint) {
                return;
            }
            const size = (props.endingPoint - props.startingPoint) / (props.defaultDuration / props.defaultInterval)
            const p = Math.round(progress.value + random(size * (1 - props.variation), size * (1 + props.variation)))
            progress.value = Math.min(p, props.endingPoint)
            timeoutId.value = setTimeout(
                loop,
                random(props.defaultInterval * (1 - props.variation), props.defaultInterval * (1 + props.variation))
            )
        }

        onUnmounted(() => {
            scroll.enable();
        });

        watch(() => props.visible, (isVisible) => {
            isVisible ? start() : stop();
        }, {immediate: true});

        return {
            showProgress,
            progress
        }
    },
    render() {
        return (
            <>
                <div class={[styles.loader_container, {
                    [styles.visible]: this.showProgress
                }]}>
                    <div class={["progress w-100", styles.progress_bar]}>
                        <div
                            class="progress-bar"
                            role="progressbar"
                            aria-valuemax="100"
                            aria-valuemin="0"
                            aria-valuenow="progress"
                            style={`width: ${this.progress}%`}
                        />
                    </div>
                </div>
            </>
        )
    }
})