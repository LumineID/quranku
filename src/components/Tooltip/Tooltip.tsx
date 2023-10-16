import { PropType, defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Tooltip } from "bootstrap";
import { useEventListener } from "@vueuse/core";

export default defineComponent({
    emits: {
        init: (tooltip: Tooltip, el: HTMLElement) => true
    },
    props: {
        tag: {
            type: String,
            default: "span"
        },
        title: {
            type: String
        },
        timeout: {
            type: Number,
            default: 500
        },
        options: {
            type: Object as PropType<Partial<Tooltip.Options>>,
            default: () => ({})
        },
        placement: {
            type: String as PropType<Tooltip.PopoverPlacement>,
            default: "top"
        }
    },
    setup(props, { emit }) {
        const el = ref<HTMLElement | null>(null);
        const tooltip = ref<Tooltip | null>(null);

        let timeout: ReturnType<typeof setTimeout> | null = null;

        // auto hide saat tooltip diklik
        function hide() {
            if (props.timeout !== undefined && props.timeout > 0) {
                timeout !== null && clearTimeout(timeout);
                timeout = setTimeout(() => tooltip.value?.hide(), props.timeout);
            }
        }

        onMounted(() => {
            const options = Object.assign(props.options, { placements: props.placement });
            
            tooltip.value = Tooltip.getOrCreateInstance(el.value!, options);
            tooltip.value.enable();

            useEventListener(el.value, "click", hide);

            setTimeout(() => {
                emit("init", tooltip.value as Tooltip, el.value!);
            }, 100)
        });

        onBeforeUnmount(() => {
            tooltip.value?.hide();
            tooltip.value?.disable();
        });

        watch(() => props.title, () => {
            el.value?.setAttribute("data-bs-original-title", props.title as string);
        });

        return {
            el
        }
    },
    render() {
        return h(this.tag, {
            ref: "el",
            title: this.title,
            class: "cursor-pointer",
            ...this.$attrs
        }, this.$slots.default?.())
    }
})