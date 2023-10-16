import { PropClasses } from "@/types";
import { computed, defineComponent, PropType, h } from "vue";

type Type = "dark" | "light" | "primary" | "secondary" | "danger" | "info" | "warning" | "success" | "body-tertiary";

export default defineComponent({
    props: {
        tag: {
			type: String,
			default: "span",
		},
		type: {
			type: String as PropType<Type>,
			default: "primary"
		},
		gradient: {
			type: Boolean,
			default: false
		},
		text: {
			type: String,
		},
		rounded: {
			type: Boolean,
			default: false,
		},
		circle: {
			type: Boolean,
			default: false,
		},
		icon: {
			type: [Array, String],
		}
    },
    setup(props) {
        const classes = computed<PropClasses>(() => {
            return [
				"badge",
				`bg-${props.type}`,
				{ "bg-gradient": props.gradient },
				{ "rounded-pill": props.rounded },
				{ "rounded-circle": props.circle },
			];
        });

        return { classes }
    },
    render() {
        return h(this.tag, {class: this.classes}, (
            <>
                {this.icon && (
                    <font-awesome-icon
                        icon={this.icon}
                        class={{'me-2': this.text || this.$slots.default}}
                    />
                )}
                {this.$slots.default?.() || this.text}
            </>
        ))
    }
})