import { PropBsSizeLarge, PropBsSizeMedium, PropClasses } from "@/types";
import { PropType, Teleport, computed, defineComponent, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { Modal } from "bootstrap";
import { useEventListener } from "@vueuse/core";
import random from "@/helpers/random";
import sleep from "@/helpers/sleep";

export default defineComponent({
    inheritAttrs: false,
    props: {
        title: {
            type: String
        },
        centered: {
            type: Boolean,
            default: true
        },
        scrollable: {
            type: Boolean,
            default: false
        },
        options: {
            type: Object as PropType<Record<string, any>>,
            default: () => ({})
        },
        size: {
            type: String as PropType<PropBsSizeMedium>,
            default: "md"
        },
        fullscreen: {
            type: [Boolean, String] as PropType<PropBsSizeLarge | boolean>,
            default: undefined
        },
        headerClasses: {
            type: [String, Array] as PropType<PropClasses>
        },
        bodyClasses: {
            type: [String, Array] as PropType<PropClasses>
        },
        footerClasses: {
            type: [String, Array] as PropType<PropClasses>
        }
    },
    setup(props, { attrs, emit }) {
        const id = ref<string>(`lm-modal-${random.string()}`);
        const modal = ref<Modal | null>(null);

        const classes = computed((): PropClasses => {
            const classes = [
                "modal-dialog",
                `modal-${props.size}`,
                { "modal-dialog-centered": props.centered },
                { "modal-dialog-scrollable": props.scrollable }
            ];

            if (props.fullscreen) {
                classes.push(props.fullscreen === true ? "modal-fullscreen" : `modal-fullscreen-${props.fullscreen}`)
            }

            return classes;
        });

        const show = computed<boolean>({
            set(value) {
                emit("update:modelValue", value)
            },
            get() {
                return Boolean(attrs.modelValue)
            }
        });

        const toggler = {
            dispose: () => modal.value?.dispose(),
            hide:    () => modal.value?.hide(),
            show:    () => modal.value?.show(),
            toggle:  () => modal.value?.toggle()
        }

        onMounted(() => {
            const el = document.getElementById(id.value) as HTMLElement;

            useEventListener(el, "shown.bs.modal", () => show.value = true);
            useEventListener(el, "hidden.bs.modal", () => show.value = false);
            useEventListener(el, "hidePrevented.bs.modal", () => show.value = false);

            modal.value = new Modal(el, props.options);

            sleep(500).then(() => {
                if (show.value) {
                    toggler.show();
                }
            })
        });

        onBeforeUnmount(() => {
            toggler.hide();
            toggler.dispose();
        });

        watch(show, (isShown) => {
            if (isShown) {
                toggler.show()
            } else {
                toggler.hide()
            }
        });

        return {
            id,
            show,
            classes
        }
    },
    render() {
        return (
            <Teleport to="body">
                <div
                    id={this.id}
                    aria-hidden={this.show == false}
                    aria-labelledby={`${this.id}-label`}
                    tabindex="-1"
                    class="modal fade"
                >
                    <div class={this.classes}>
                        <div class="modal-content">
                            {(this.title || this.$slots.header) && (
                                <div class={["modal-header", this.headerClasses]}>
                                    {this.$slots.header?.() || (
                                        <>
                                            <h5 class="modal-title" id={`${this.id}-label`}>
                                                {this.title}
                                            </h5>
                                            <button
                                                type="button"
                                                class="btn-close"
                                                data-bs-dismiss="modal"
                                                aria-label="Close"
                                                onClick={() => this.show = false}
                                            />
                                        </>
                                    )}
                                </div>
                            )}
                            {this.$slots.default && (
                                <div class={["modal-body", this.bodyClasses]}>
                                    {this.$slots.default()}
                                </div>
                            )}
                            {this.$slots.footer && (
                                <div class={["modal-footer", this.footerClasses]}>
                                    {this.$slots.footer()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Teleport>
        )
    }
})