import { computed, defineComponent, h } from "vue";
import { useSettings } from "@/hooks/settings";
import styles from "./Skeleton.module.scss";

export default defineComponent({
    props: {
        tag: {
			type: String,
			default: "div",
		},
		width: {
			type: String,
		},
		height: {
			type: String,
		},
		borderRadius: {
			type: String,
			default: undefined
		}
    },
    setup(props) {
        const { isDarkMode } = useSettings();
        const style = computed(() => ({
            "width": props.width,
            "height": props.height,
            "border-radius": props.borderRadius
        }));

        return {
            style,
            isDarkMode
        }
    },
    render() {
        return h(this.tag, {
            ...this.$attrs,
            style: this.style,
            class: [styles.skeleton, {[styles.dark]: this.isDarkMode}],
        });
    }
})