import { defineComponent, ref, watch, PropType } from "vue";
import { PropClasses } from "@/types";
import { useEventListener } from "@vueuse/core";
import random from "@/helpers/random";
import styles from "./Range.module.scss";

export default defineComponent({
    inheritAttrs: false,
    emits: {
        "input"             : (event: Event) => true,
        "focus"             : (event: FocusEvent) => true,
        "blur"              : (event: FocusEvent) => true,
        "change"            : (event: Event) => true,
        "update:modelValue" : (value: number) => true
    },
    props: {
        min: {
			type: Number,
			default: 0,
		},
		max: {
			type: Number,
			default: 100,
		},
        step: {
            type: Number  
        },
        label: {
            type: String
        },
        disabled: {
            type: Boolean,
            default: false
        },
        canUpdateBeforeWidth: {
            type: Boolean,
            default: true
        },
        canUpdateAfterWidth: {
            type: Boolean,
            default: true
        },
        formClasses: {
            type: [String, Array] as PropType<PropClasses>
        },
        lazyUpdate: {
            type: Boolean,
            default: false
        }
    },
    setup(props, { emit, attrs, expose }) {
        const id = ref<string>(`lm-range-${random.string()}`);
        const beforeWidth = ref<number>(0);
        const afterWidth = ref<number>(0);
        const input = ref<HTMLInputElement | null>(null);
        const value = ref<number>(Number(attrs.modelValue) || 0);

        function updateWidth() {
            let percent;
            percent = ((Number(value.value) - props.min) / (props.max - props.min) * 100);
            percent = isNaN(percent) ? 0 : percent;
            percent = percent + ((percent > 0 && Math.floor(percent) < 20) ? 0.7 : 0);

            if (props.canUpdateBeforeWidth) {
                beforeWidth.value = percent;
            }

            if (props.canUpdateAfterWidth) {
                afterWidth.value = percent;
            }
        }

        function addEvent<T = Event>(name: string, fn: (event: T) => void): void {
            useEventListener(input, name, fn);
        }

        function eventHandler(type: "focus" | "blur" | "input" | "change"): (e: Event) => void {
            return function (e: Event) {
                switch (type) {
                    case "focus":
                        emit("focus", e as FocusEvent);
                        break;
                    case "blur":
                        emit("blur", e as FocusEvent);
                        break;
                    case "input":
                        props.lazyUpdate == false && emit("update:modelValue", Number((e.target as HTMLInputElement).value));
                        emit("input", e);
                        break;
                    case "change":
                        props.lazyUpdate == true && emit("update:modelValue", Number((e.target as HTMLInputElement).value));
                        emit("change", e);
                        break;
                }
            }
        }

        watch(() => [
            value.value,
            props.max,
            props.canUpdateBeforeWidth,
            props.canUpdateAfterWidth
        ].toString(), updateWidth, {immediate: true});

        watch(() => attrs.modelValue, (v) => {
            value.value = Number(v) || 0
        });

        expose({
            addEvent
        });

        return {
            input,
            id,
            value,
            beforeWidth,
            afterWidth,
            eventHandler
        }
    },
    render() {
        return (
            <>
                <div class={["form-group", this.formClasses]}>
                    {(this.label || this.$slots.label) && (
                        <label class="form-label" for={this.id}>
                            {this.$slots.label?.() || this.label}
                        </label>
                    )}
                    <div class={[styles.range_container]}>
                        <input
                            ref="input"
                            type="range"
                            v-model={this.value}
                            class={["form-range", styles.custom_range]}
                            min={this.min}
                            max={this.max}
                            step={this.step}
                            id={this.id}
                            onFocus={this.eventHandler("focus")}
                            onBlur={this.eventHandler("blur")}
                            onInput={this.eventHandler("input")}
                            onChange={this.eventHandler("change")}
                            style={[`--form-range-before-width: ${this.beforeWidth}%`, `--form-range-after-width: ${this.afterWidth}%`, this.$attrs.style as string]}
                            disabled={this.disabled}
                            {...this.$attrs}
                        />
                    </div>
                </div>
            </>
        )
    }
})