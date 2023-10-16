import { computed, defineComponent, Transition, watch, ref } from "vue";
import { LocaleCode } from "@/types";
import styles from "./Setting.module.scss";
import scroll from "@/helpers/scroll";
import Button from "@/components/Button/Button";
import Checkbox from "../Input/Checkbox";
import UsePwa, { DefaultSlotProps } from "../PWA/UsePwa";
import Range from "../Input/Range";
import { useEventListener } from "@vueuse/core";

export default defineComponent({
    emits: {
        "update:show": (value: boolean) => true
    },
    props: {
        show: {
            type: Boolean
        }
    },
    setup(props, { emit }) {
        const scaleFitures = ref<boolean>(isSupportScale());
        const shouldShow = computed<boolean>({
            set(value) {
                emit("update:show", value)
            },
            get() {
                return Boolean(props.show);
            }
        });

        function isSupportScale() {
            const touchDevice = (navigator.maxTouchPoints || "ontouchstart" in document.documentElement);
            const mobile = /iPhone|iPad|iPod|Android|webOS/i.test(navigator.userAgent);

            return Boolean(touchDevice && mobile);
        }

        useEventListener(window, "resize", () => {
            scaleFitures.value = isSupportScale();
        });

        watch(shouldShow, (show) => {
            show ? scroll.disable() : scroll.enable();
        }, {immediate: true})

        return {
            shouldShow,
            scaleFitures
        }
    },
    render() {
        return (
            <Transition
                enterActiveClass={styles.animate_in}
                leaveActiveClass={styles.animate_out}
                onBeforeLeave={(el) => {
                    el.classList.remove(styles.blur)
                }}
                onAfterEnter={(el) => {
                    el.classList.add(styles.blur)
                }}
            >
                {this.shouldShow && (
                    <div class={styles.container} onClick={((e: Event) => {
                        if ((e.target as HTMLElement).classList.contains(styles.card_container)) {
                            this.shouldShow = false
                        }
                    })}>
                        <div class={styles.card_container}>
                            <div class={["card", styles.card]}>
                                <div class={["card-header d-flex justify-content-between", styles.card_header]}>
                                    <h4 class="card-title">{this.$t("general.setting")}</h4>
                                    <div class="h-100 d-flex align-items-center">
                                        <button class="btn-close" onClick={() => this.shouldShow = false}></button>
                                    </div>
                                </div>
                                <div class={["card-body custom-scrollbar", styles.card_body]}>
                                    <UsePwa>
                                        {{
                                            default: (props: DefaultSlotProps) => (
                                                <>
                                                    {props.isAvailable && (
                                                        <div class="d-flex justify-content-center mb-4 mt-3">
                                                            {props.installButton()}
                                                        </div>
                                                    )}
                                                </>
                                            )
                                        }}
                                    </UsePwa>

                                    {this.scaleFitures && (
                                        <>
                                            <h6 class="heading-small">{this.$t("general.scale")} {`(${this.$setting.scale})`}</h6>
                                            <Range
                                                v-model={this.$setting.scale}
                                                min={0.3}
                                                max={1}
                                                step={0.1}
                                                lazyUpdate
                                            />
                                        </>
                                    )}

                                    <h6 class="heading-small">{this.$t("general.language")}</h6>
                                    <nav class="nav nav-pills custom-nav-pills mb-2">
                                        {Object.keys(this.$config.LOCALE).map(locale => (
                                            <div
                                                key={locale}
                                                class={["nav-link", {active: locale == this.$setting.locale}]}
                                                onClick={() => this.$setting.locale = locale as LocaleCode}
                                            >
                                                {(this.$config.LOCALE as any)[locale]}
                                            </div>
                                        ))}
                                    </nav>
                                    <hr />
                                    <h6 class="heading-small">{this.$t("general.theme")}</h6>
                                    <nav class="nav nav-pills custom-nav-pills mb-2">
                                        {this.$config.THEMES.map(theme => (
                                            <div
                                                key={theme}
                                                class={["nav-link", {active: this.$setting.theme == theme}]}
                                                onClick={() => this.$setting.theme = theme}
                                            >
                                                <font-awesome-icon icon={theme == "auto" ? "lightbulb" : (theme == "dark" ? "moon" : "sun")} />
                                                <span class="ms-2">{this.$t(`setting.theme.${theme}`)}</span>
                                            </div>
                                        ))}
                                    </nav>
                                    {this.$setting.theme == "auto" && (
                                        <small class="text-muted">
                                            {this.$t("setting.theme.message.auto")}
                                        </small>
                                    )}
                                    <hr />
                                    <h6 class="heading-small">{this.$t("general.quran-font")}</h6>
                                    <nav class="nav nav-pills custom-nav-pills mb-2">
                                        {this.$config.FONTS.map(font => (
                                            <div
                                                key={font}
                                                class={["nav-link", {active: this.$setting.fontType == font}]}
                                                onClick={() => this.$setting.fontType = font}
                                            >
                                                {font}
                                            </div>
                                        ))}
                                    </nav>
                                    <div class="d-flex justify-content-between mt-3">
                                        <div class="h-100">
                                            <h6 class="heading-small mt-2">{this.$t("general.font-size")}</h6>
                                        </div>
                                        <div class="d-flex">
                                            <Button onClick={() => this.$setting.fontSize--} disabled={this.$setting.fontSize <= 1} outline>
                                                <font-awesome-icon icon="minus" />
                                            </Button>
                                            <span class="h6 fw-bold h-100 d-flex align-items-center ms-4 me-4">
                                                {this.$setting.fontSize}
                                            </span>
                                            <Button onClick={() => this.$setting.fontSize++} disabled={this.$setting.fontSize >= 10} outline>
                                                <font-awesome-icon icon="plus" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div class={["text-end font-arabic-auto fs-arabic-auto mt-3 mb-3", styles.text_bismillah]}>
                                        بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                                    </div>
                                    <h6 class="heading-small">{this.$t("general.word-by-word")}</h6>
                                    <div class="row border-bottom mb-2 pb-2">
                                        <div class="col-4 d-flex align-items-center">
                                            <Checkbox
                                                v-model={this.$setting.transliteration}
                                                label={this.$t("general.transliteration")}
                                            />
                                        </div>
                                        <div class="col-8 d-flex justify-content-end">
                                            <div class="row">
                                                <div class="col-6 d-flex align-items-center">
                                                    <h6 class="pe-3">{this.$t("setting.display")}:</h6>
                                                </div>
                                                <div class="col-6">
                                                    <Checkbox
                                                        label={this.$t("setting.display-inline")}
                                                        v-model={this.$setting.transliterationDisplay.inline}
                                                        disabled={!this.$setting.transliteration}
                                                    />
                                                    <Checkbox
                                                        label={this.$t("setting.display-tooltip")}
                                                        v-model={this.$setting.transliterationDisplay.tooltip}
                                                        disabled={!this.$setting.transliteration}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row mt-2">
                                        <div class="col-4 d-flex align-items-center">
                                            <Checkbox
                                                v-model={this.$setting.translation}
                                                label={this.$t("setting.translation")}
                                            />
                                        </div>
                                        <div class="col-8 d-flex justify-content-end">
                                            <div class="row">
                                                <div class="col-6 d-flex align-items-center">
                                                    <h6 class="pe-3">{this.$t("setting.display")}:</h6>
                                                </div>
                                                <div class="col-6">
                                                    <Checkbox
                                                        label={this.$t("setting.display-inline")}
                                                        v-model={this.$setting.translationDisplay.inline}
                                                        disabled={!this.$setting.translation}
                                                    />
                                                    <Checkbox
                                                        label={this.$t("setting.display-tooltip")}
                                                        v-model={this.$setting.translationDisplay.tooltip}
                                                        disabled={!this.$setting.translation}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <hr />
                                    <div class="d-flex justify-content-center mt-4">
                                        <Button type="primary" onClick={this.$setting.resetToDefault}>
                                            {this.$t("setting.reset-default")}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Transition>
        )
    }
})