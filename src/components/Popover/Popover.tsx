import { PropType, defineComponent, h, onBeforeUnmount, onMounted, ref } from "vue";
import { Popover, Tooltip } from "bootstrap";
import { onClickOutside, useEventListener } from "@vueuse/core";

export default defineComponent({
    emits: {
        init: (popover: Popover, el: HTMLElement) => true
    },
    props: {
        tag: {
            type: String,
            default: "span"
        },
        title: {
            type: String
        },
        content: {
            type: String
        },
        options: {
            type: Object as PropType<Partial<Popover.Options>>,
            default: () => ({})
        },
        placement: {
            type: String as PropType<Tooltip.PopoverPlacement>,
            default: "top"
        },
        closeClickOutside: {
            type: Boolean,
            default: true
        }
    },
    setup(props, { emit }) {
        const refs = ref<{
            root: HTMLElement    | null
            title: HTMLElement   | null
            content: HTMLElement | null
        }>({
            root: null,
            title: null,
            content: null
        });

        const popover = ref<Popover | null>(null);

        let cleanUpClickOutside: null | ReturnType<typeof onClickOutside> = null;

        function registerOutsideClick() {
            cleanUpClickOutside?.();

            const id = refs.value.root?.getAttribute("aria-describedby");
            const popoverEl = document.getElementById(String(id));
            if (popoverEl) {
                cleanUpClickOutside = onClickOutside(popoverEl, () => {
                    if (props.closeClickOutside) {
                        popover.value?.hide()
                    }
                });
            }
        }

        onMounted(() => {
            const options = Object.assign(props.options, {
                placements: props.placement
            });

            if (!options.content) {
                options.content = () => {
                    return (refs.value.content ? refs.value.content! : props.content || "");
                }
            }

            if (!options.title) {
                options.title = () => {
                    return (refs.value.title ? refs.value.title : props.title || "");
                }
            }

            popover.value = Popover.getOrCreateInstance(refs.value.root!, options);
            popover.value.enable();

            useEventListener(refs.value.root, "shown.bs.popover", (e) => {
                window.addEventListener("pointerdown", registerOutsideClick);
            });

            useEventListener(refs.value.root, "hide.bs.popover", () => {
                window.removeEventListener("pointerdown", registerOutsideClick);
                cleanUpClickOutside?.();
            });

            setTimeout(() => {
                emit("init", popover.value!, refs.value.root!);
            }, 100)
        });

        onBeforeUnmount(() => {
            popover.value?.hide();
            window.removeEventListener("pointerdown", registerOutsideClick);
            cleanUpClickOutside?.();
        });

        return {
            refs
        }
    },
    render() {
        return h(this.tag, {
            ref: (ref) => this.refs.root = (ref as HTMLElement),
            class: "cursor-pointer",
            ...this.$attrs
        }, [
            <>
                {this.$slots.default?.()}
    
                {this.$slots.title && (
                    <div data-bs-popover="title" hidden>
                        <div ref={(ref) => this.refs.title = (ref as HTMLElement)}>
                            {this.$slots.title()}
                        </div>
                    </div>
                )}
                {this.$slots.content && (
                    <div data-bs-popover="content" hidden>
                        <div ref={(ref) => this.refs.content = (ref as HTMLElement)}>
                            {this.$slots.content()}
                        </div>
                    </div>
                )}
            </>
        ])
    }
})