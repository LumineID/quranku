import { BeforeInstallPromptEvent } from "@/global";
import { VNode, computed, defineComponent } from "vue";
import { useState } from "@/hooks/state";
import Button from "../Button/Button";

export interface DefaultSlotProps {
    isAvailable: boolean
    install: () => Promise<boolean>
    installButton: (attrs?: Record<string, any>) => VNode
}

export default defineComponent({
    setup() {
        const state = useState();

        const prompt = computed<BeforeInstallPromptEvent | null>({
            set(value) {
                state.get("PWA_PROMPT", value)
            },
            get() {
                return state.get("PWA_PROMPT");
            }
        });

        const isAvailable = computed<boolean>(() => {
            return prompt.value !== null;
        });

        function install() {
            return new Promise((resolve, reject) => {
                if (!prompt.value) {
                    return reject("pwa not available");
                }

                prompt.value.prompt();
                prompt.value.userChoice.then((result) => {
                    resolve(result.outcome == "accepted");
                    if (result.outcome == "accepted") {
                        prompt.value = null;
                    }
                });
            })
        }

        return { install, isAvailable }
    },
    render() {
        return this.$slots.default?.({
            isAvailable: this.isAvailable,
            install: this.install,
            installButton: (attrs: Record<string, any> = {}) => (
                <Button type="default" onClick={this.install} {...attrs}>
                    <font-awesome-icon icon="mobile-screen" class="me-2" />
                    <span v-html={this.$t("pwa.add-home-screen", {name: this.$config.APP_NAME})} />
                </Button>
            )
        });
    }
})