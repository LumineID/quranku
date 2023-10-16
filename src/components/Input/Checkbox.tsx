import { PropType, computed, defineComponent, ref } from "vue";
import { PropClasses, PropCheckbokType } from "@/types";
import random from "@/helpers/random";
import collect from "collect.js";

export default defineComponent({
    inheritAttrs: false,
    props: {
        label: {
            type: String
        },
        nativeName: {
            type: String // name for type radio
        },
        nativeValue: {
            type: String // value for type radio
        },
        formClasses: {
            type: String as PropType<PropClasses>
        },
        labelClasses: {
            type: String as PropType<PropClasses>
        },
        inline: {
            type: Boolean,
            default: false
        },
        disabled: {
            type: Boolean,
            default: false
        },
        type: {
            type: String as PropType<PropCheckbokType>,
            default: "checkbox"
        }
    },
    setup(props, {attrs, emit}) {
        const id = ref<string>(`lm-checkbox-${random.string()}`);

        const value = computed<boolean | string>({
            set(value) {
                emit("update:modelValue", value);
            },
            get() {
                return (props.type == "radio" ? String(attrs.modelValue) : Boolean(attrs.modelValue));
            }
        });

        const checkboxAttr = computed(() => {
            const attr = (props.type == "radio" ? ({
                name: props.nativeName,
                value: props.nativeValue
            }) : ({}));

            return {...attr, ...collect(attrs).except(["modelValue"]).items}
        })

        return {
            id,
            value,
            checkboxAttr
        }
    },
    render() {
        return (
            <>
                <div class={["form-check", this.formClasses, {"form-check-inline": this.inline, "form-switch": this.type === "switch"}]}>
                    <input
                        type={this.type == 'radio' ? 'radio' : 'checkbox'}
                        id={this.id}
                        v-model={this.value}
                        disabled={this.disabled}
                        class="form-check-input"
                        {...this.checkboxAttr}
                    />
                    <label class={["form-check-label", this.labelClasses]} for={this.id}>
                        {this.$slots.default?.() || this.label}
                    </label>
                </div>
            </>
        )
    }
});