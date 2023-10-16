import { PropBsSize, PropClasses } from "@/types";
import { computed, defineComponent, h, PropType } from "vue";

type Type = "default" | "primary" | "success" | "danger" | "info" | "warning" | "link" | "secondary" | "dark" | "light" | "transparent";

export default defineComponent({
    emits: {
        click: (event: MouseEvent) => true
    },
    props: {
        tag: {
			type: String,
			default: "button",
		},
		nativeType: {
			type: String,
			default: "button",
		},
		outline: {
			type: Boolean,
			default: false,
		},
		rounded: {
			type: Boolean,
			default: false,
		},
		type: {
			type: String as PropType<Type>,
			default: "default"
		},
		gradient: {
			type: Boolean,
			default: false
		},
		text: {
			type: String,
		},
		size: {
			type: String as PropType<PropBsSize>,
			default: "md"
		},
        disabled: {
            type: Boolean,
            default: false
        }
    },
    setup(props) {
        const classes = computed<PropClasses>(() => {
            return [
				"btn",
				`btn-${props.outline ? "outline-" : ""}${props.type}`,
				`btn-${props.size}`,
                {"disabled": props.disabled},
				{"bg-gradient": props.gradient},
				{"rounded-circle": props.rounded}
			];
        });

        return { classes }
    },
    render() {
        return h(this.tag, {disabled: this.disabled, class: this.classes, onClick: (e: MouseEvent) => this.$emit("click", e)}, (
            <>
                {this.$slots.default?.() || this.text}
            </>
        ))
    }
})

