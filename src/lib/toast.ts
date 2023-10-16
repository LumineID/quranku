import { toast, ToastOptions } from "vue3-toastify";
import { useSettings } from "@/hooks/settings";
import { h } from "vue";
import collect from "collect.js";
import ToastConfirmTimer from "@/components/ToastMessage/ToastConfirmTimer";

const confirm = (message: string, options: ToastOptions = {}): Promise<{isConfirmed: boolean, props: object}> => {
    const setting = useSettings();
    return new Promise(resolve => {
        let toastId: any = null;
        options = {
            ...options,
            closeButton: false,
            closeOnClick: false,
            autoClose: options.autoClose || 5000,
            theme: setting.isDarkMode.value ? "dark" : "light",
            data: {
                ...(options.data || {}),
                message: message,
                onCancel(props: object) {
                    if (toastId) toast.update(toastId, {onClose: null});
                    resolve({
                        props: collect(props).forget(["onCancel"]).items, 
                        isConfirmed: false
                    });
                }
            },
            onClose: <T = {}>(props: T) => {
                resolve({
                    props: collect(props as object).forget(["onCancel"]).items, 
                    isConfirmed: true
                });
            }
        }
        toastId = toast.warning((props: any) => {
            return h(ToastConfirmTimer, props)
        }, options)
    })
}

export default Object.assign(toast, { confirm });