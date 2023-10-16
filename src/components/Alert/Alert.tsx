import { computed, defineComponent, onMounted, onUnmounted, ref, PropType } from "vue";
import { Alert } from "bootstrap";
import { PropClasses } from "@/types";

type AlertType = "primary" | "danger" | "success" | "secondary" | "warning" | "info" | "light" | "dark";

export default defineComponent({
    props: {
        type: {
			type: String as PropType<AlertType>,
			default: "primary"
		},
		gradient: {
			type: Boolean,
			default: false
		},
		dismissible: {
			type: Boolean,
			default: false,
		},
		fadeShow: {
			type: Boolean,
			default: true,
		},
		transparent: {
			type: Boolean,
			default: false,
		}
    },
    setup(props) {
		const alert = ref<Alert | null>(null);
        const el = ref<HTMLElement | null>(null);

        const classes = computed<PropClasses>(() => {
            return [
                "alert",
				`alert-${props.type}`,
				{ "bg-transparent": props.transparent },
				{ "bg-gradient": props.gradient && !props.transparent },
				{ "fade show": props.fadeShow },
				{ "alert-dismissible": props.dismissible },
            ]
        });

		onMounted(() => {
			alert.value = new Alert(el.value as HTMLElement);
		});

		onUnmounted(() => {
            alert.value?.dispose();
		});

		return {
            classes
        }
    },
    render() {
        return (
            <>
                <div class={this.classes} ref="alert" role="alert">
                    {this.dismissible && (
                        <button
                            type="button"
                            class="btn-close"
                            data-bs-dismiss="alert"
                            aria-label="Close"
                        />
                    )}
                    
                    {this.$slots.default?.()}
                </div>
            </>
        )
    }
})