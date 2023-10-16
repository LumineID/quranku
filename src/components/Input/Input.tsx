import { PropType, computed, defineComponent, ref } from "vue";
import { PropClasses, PropBsSize } from "@/types";
import random from "@/helpers/random";

export default defineComponent({
    inheritAttrs: false,
    emits: {
        "input"             : (event: Event) => true,
        "focus"             : (event: FocusEvent) => true,
        "blur"              : (event: FocusEvent) => true,
        "change"            : (event: Event) => true,
        "update:modelValue" : (value: string) => true,
        "click:iconLeft"    : (event: MouseEvent) => true,
        "click:iconRight"   : (event: MouseEvent) => true,
    },
    props: {
        tag: {
			type: String,
			default: "input"
		},
        iconLeft: {
			type: [String, Array],
		},
		iconRight: {
			type: [String, Array],
		},
		formClasses: {
			type: [String, Array] as PropType<PropClasses>,
		},
		valid: {
			type: Boolean,
			default: undefined
		},
		feedback: {
			type: String,
		},
		help: {
			type: String,
		},
		label: {
			type: String,
		},
		size: {
			type: String as PropType<PropBsSize>,
			default: "md"
		},
		disabled: {
			type: Boolean,
			default: false
		},
        setter: {
            type: Function as PropType<(value: string) => any>
        }
    },
    setup(props, {emit, attrs}) {
        const id = ref<string>(`lm-input-${random.string()}`);

        const value = computed<string>({
            set(value) {
                emit("update:modelValue", props.setter ? props.setter(value) : value);
            },
            get() {
                return String(attrs.modelValue ? attrs.modelValue : "");
            }
        });

        const inputAttr = computed(() => ({
            id: id.value,
            disabled: props.disabled,
            onFocus:  (e: FocusEvent) => emit("focus", e),
            onBlur:   (e: FocusEvent) => emit("blur", e),
            onInput:  (e: Event)      => emit("input", e),
            onChange: (e: Event)      => emit("change", e),
            class: [
                `form-control form-control-${props.size}`, {
                    "is-invalid": props.valid === false,
                    "is-valid": props.valid === true
                }
            ]
        }));

        return {
            id,
            value,
            inputAttr
        }
    },
    render() {
        return (
            <>
                <div class={this.formClasses}>
                    {this.label && (
                        <label for={this.id} class="form-label">
                            {this.label}
                        </label>
                    )}
                    <div class="input-group">
                        {(this.iconLeft || this.$slots.iconLeft) && (
                            <span
                                class="input-group-text"
                                onClick={(e: MouseEvent) => this.$emit("click:iconLeft", e)}
                            >
                                {this.$slots.iconLeft?.() || (<font-awesome-icon icon={this.iconLeft} />)}
                            </span>
                        )}
                        {this.tag == "input"
                            ? (<input v-model={this.value}
                                {...this.inputAttr}
                                {...this.$collect(this.$attrs).except(["modelValue"]).items }
                            />) 
                            : (<textarea v-model={this.value}
                                {...this.inputAttr}
                                {...this.$collect(this.$attrs).except(["modelValue"]).items }
                            />)
                        }
                        {(this.iconRight || this.$slots.iconRight) && (
                            <span
                                class="input-group-text"
                                onClick={(e: MouseEvent) => this.$emit("click:iconRight", e)}
                            >
                                {this.$slots.iconRight?.() || (<font-awesome-icon icon={this.iconRight} />)}
                            </span>
                        )}
                    </div>
                    {(this.help || this.$slots.help) && (
                        <div>
                            {this.$slots.help?.() || (<small class="text-muted">{this.help}</small>)}
                        </div>
                    )}
                    {(this.valid === false && (this.feedback?.trim() || this.$slots.feedback)) && (
                        <div class="invalid-feedback d-block">
                            {this.$slots.feedback?.() || this.feedback}
                        </div>
                    )}
                </div>
            </>
        )
    }
})