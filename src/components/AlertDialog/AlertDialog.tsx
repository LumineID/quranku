/**
 * 
 * Komponent Alert Dialog styelenya kaya di IOS gitu, tapi beda sih soalnya sengaja pengenya suka-suka saya :v
 * 
 */
import { nextTick, onMounted, ref, watch, defineComponent, Transition } from "vue";
import { until, useEventListener } from "@vueuse/core";
import collect from "collect.js";
import styles from "./AlertDialog.module.scss";

interface Buttons {
    text: string,
    bold?: boolean,
    handler?: (button: Record<string, any>) => void,
    [key: string]: any
}

export interface AlertOptions {
    title?: string,                  // @String dialog title
    confirmText?: string,            // @String button confirm text
    cancelText?: string,             // @String button cancel text
    closeOutside?: boolean,          // @Boolean close dialog saat klik pada outside box
    disableScrollOutside?: boolean,  // @Boolean matikan scroll outside
    showTimer?: boolean,             // @Boolean kemajuan auto close timer
    autoClose?: number,              // @Number auto close timer dalam ms (miliseconds)
    darkMode?: boolean,              // @Boolean dark mode
    buttons?: Array<Buttons>         // @Array dialog button [{text: String, handel: Function}]
}

export interface AlertResponse {
    context: Record<string, any>,
    source: string
}

let DEFAULT_OPTIONS = {
    title: "",
    confirmText: "OK",
    cancelText: "Batal",
    closeOutside: false,
    disableScrollOutside: true,
    showTimer: true,
    autoClose: 0,
    darkMode: false,
    buttons: []
}

export default defineComponent({
    setup(props, { expose }) {
        const show = ref<boolean>(false);
        const dismissFn = ref<(e?: Event) => void>(() => null);
        const keydownFn = ref<(e: KeyboardEvent) => void>(() => null);
        const pendingAlert = ref<Array<{isPending: boolean, fn: (id: number) => Promise<AlertResponse>}>>([]);
        const progressTime = ref<number>(0);
        const options = ref<AlertOptions & {text?: string}>({...DEFAULT_OPTIONS});
        const animated = ref<boolean>(false);
        
        const runAnimationShake = (function(this: {timeoutId: ReturnType<typeof setTimeout> | null}, ms: number = 800) {
            animated.value = true;

            this.timeoutId !== null && clearTimeout(this.timeoutId);

            this.timeoutId = setTimeout(() => {
                animated.value = false;
            }, ms);
        }).bind({timeoutId: null});

        const setGlobalOptions = (option: AlertOptions) => {
            DEFAULT_OPTIONS = Object.assign(DEFAULT_OPTIONS, option);
        }

        const showAlert = (isShow: boolean) => new Promise<void>(resolve => {
            nextTick(() => {
                show.value = isShow;

                nextTick(() => {
                    resolve();
                })
            })
        });

        const getDefaultOptions = (options: AlertOptions = {}): AlertOptions => {
            const keys = Object.keys(DEFAULT_OPTIONS);
            const result = keys.map(key => {
                if (Object.keys(options).includes(key)) {
                    return [key, options[key as keyof AlertOptions]]
                } else {
                    return [key, DEFAULT_OPTIONS[key as keyof AlertOptions]]
                }
            })
            
            return result.reduce((result, [key, value]) => ({...result, [key as string]: value}), {});
        }

        watch(show, (isShow) => {
            nextTick(() => {
                if (isShow && options.value.disableScrollOutside) {
                    document.body.classList.add(styles.no_scroll);
                } else {
                    document.body.classList.remove(styles.no_scroll);
                }
            })
        });

        onMounted(() => {
            useEventListener(window, "keydown", (e: KeyboardEvent) => {
                if (typeof keydownFn.value == "function") {
                    keydownFn.value(e);
                }
            })
        });

        const alert = (text: string, option: AlertOptions = {}): Promise<AlertResponse> => {
            const promises = (id: number) => new Promise<AlertResponse>((resolve) => {
                const {
                    title,
                    showTimer,
                    disableScrollOutside,
                    autoClose,
                    closeOutside,
                    confirmText,
                    buttons,
                    darkMode
                } = getDefaultOptions(option) as typeof DEFAULT_OPTIONS;

                options.value.text = text;
                options.value.title = title;
                options.value.showTimer = showTimer;
                options.value.disableScrollOutside = disableScrollOutside
                options.value.darkMode = darkMode;

                const resolveResult = (source: string, context: Record<string, any> = {}) => {
                    resolve({context, source});
                }

                const isAutoClose = (autoClose > 0);

                if (!isAutoClose) {
                    options.value.showTimer = false;
                }

                options.value.buttons = (buttons.length == 0)
                    ? [{text: confirmText, bold: true}]
                    : buttons;

                options.value.buttons = options.value.buttons.map((btn: Buttons, index: number) => {
                    const handler = btn.handler;
                    const newHandler = (button: Record<string, any>) => {
                        const result = collect({...button, index}).except(["handler"]).items;
                        resolveResult("button", result);
                        if (handler) {
                            handler(result)
                        }
                    }
                    
                    btn.handler = newHandler
                    return btn;
                });

                dismissFn.value = () => {
                    if (closeOutside) {
                        resolveResult("outside");
                    } else {
                        runAnimationShake();
                    }
                }

                keydownFn.value = (e: KeyboardEvent) => {
                    if (e.key.toLowerCase() == "escape" && closeOutside) {
                        resolveResult("escape");
                    } else {
                        runAnimationShake();
                    }
                }

                showAlert(true).then(() => {
                    if (isAutoClose) {
                        progressTime.value = 100;
                        const endTime = Date.now() + autoClose;
                        const intervalId = setInterval(() => {
                            progressTime.value = parseFloat(((endTime - Date.now()) / autoClose * 100).toFixed(2));
                            if (progressTime.value < 0) {
                                progressTime.value = 0;
                                clearInterval(intervalId);
                                setTimeout(() => {
                                    if (pendingAlert.value[id]?.isPending) {
                                        resolveResult("auto-close");
                                    }
                                }, 500)
                            }
                        }, 100);

                        until(() => [undefined, false].includes(pendingAlert.value[id]?.isPending)).toBe(true).then(() => {
                            clearInterval(intervalId);
                        })
                    }
                })
            });

            const id = pendingAlert.value.length;
            const prevPendingAlert = pendingAlert.value.slice(0, id);

            pendingAlert.value.push({
                isPending: true,
                fn: (id: number) => promises(id)
            });

            return new Promise(resolve => {
                until(() => prevPendingAlert.length == 0 || prevPendingAlert.every(entry => entry.isPending == false)).toBe(true).then(() => {
                    setTimeout(() => {
                        pendingAlert.value[id].fn(id).then((result) => {
                            showAlert(false).then(() => {
                                keydownFn.value = () => null;
                                dismissFn.value = () => null;
                                pendingAlert.value[id].isPending = false;
                                resolve(result);
                                setTimeout(() => {
                                    delete pendingAlert.value[id];
                                }, 1000 + (id * 100));
                            })
                        })
                    }, pendingAlert.value.filter(entry => entry?.isPending == true).length < 1 ? 0 : 500);
                })
            });
        }

        const confirm = (text: string, option: AlertOptions = {}): Promise<AlertResponse> => {
            return new Promise<AlertResponse>(resolve => {
                const {cancelText, confirmText, ...others} = getDefaultOptions(option) as typeof DEFAULT_OPTIONS;
    
                alert(text, {...others, buttons: [
                    {
                        text: cancelText,
                        id: "cancel"
                    },
                    {
                        text: confirmText,
                        id: "confirm",
                        bold: true
                    }
                ]}).then((result) => {
                    result.context.isConfirmed = result.context?.id === "confirm";
                    resolve(result);
                })
            })
        }

        expose({
            confirm,
            alert,
            setGlobalOptions
        });

        return {
            show,
            animated,
            dismissFn,
            progressTime,
            options
        }
    },
    render() {
        return (
            <>
                <Transition
                    enterActiveClass="animate__animated animate__bounceIn"
                    leaveActiveClass="animate__animated animate__backOutUp"
                    onEnter={(el) => {
                        el.classList.add(styles.alert_view_overlay_active)
                    }}
                    onBeforeLeave={(el) => {
                        el.classList.remove(styles.alert_view_overlay_active);
                    }}
                >
                    {this.show && (
                        <>
                            <div class={[styles.alert_view_overlay, {[styles.dark]: this.options.darkMode}]} onClick={this.dismissFn}>
                                <div class={[styles.alert_view_container, {[styles.alert_animate]: this.animated}]}>
                                    <div class={[styles.alert_view, {[styles.dark]: this.options.darkMode}]}>
                                        <div class={styles.alert_view_inner}>
                                            {this.options.title?.trim() && (
                                                <div class={styles.alert_view_title}>
                                                    {this.options.title}
                                                </div>
                                            )}
                                            {this.options.text?.trim() && (
                                                <div class={styles.alert_view_body}>
                                                    {this.options.text}
                                                </div>
                                            )}
                                        </div>
                                        {this.options!.buttons!.length > 0 && (
                                            <div class={[styles.alert_view_footer, {[styles.flex]: this.options!.buttons!.length <= 2}]}>
                                                {this.options!.buttons!.map((button: Buttons, index: number) => {
                                                    return (
                                                        <div
                                                            role="button"
                                                            key={index}
                                                            onClick={() => button.handler!(button)}
                                                            class={[styles.alert_view_button, {[styles.bold]: button.bold}]}
                                                        >
                                                            {button.text}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                    {this.options.showTimer && (
                                        <div class={styles.alert_timer}>
                                            <div class={["progress", styles.alert_timer_progress, {[styles.dark]: this.options.darkMode}]}>
                                                <div
                                                    style={`width: ${this.progressTime}%`}
                                                    aria-valuenow={this.progressTime}
                                                    aria-valuemin="0"
                                                    aria-valuemax="100"
                                                    class="progress-bar"
                                                    role="progressbar"
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </Transition>
            </>
        )
    }
})