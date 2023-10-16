import { defineComponent } from "vue";
import i18n from "@/i18n";  

export default defineComponent({
    props: {
        toastProps: {
            type: Object,
            required: true
        },
        data: {
            type: Object,
            required: true
        },
        closeToast: {
            type: Function,
            required: true
        },
    },
    setup(props) {
        const trans = i18n.global;

        const close = (e: Event) => {
            if (props.data.onCancel) {
                props.data.onCancel(props.data)
            }
            setTimeout(() => {
                props.closeToast(e)
            }, 100)
        }

        return () => (
            <div class="d-flex align-items-center">
                <div class="me-2">{props.data.message}</div>
                <div onClick={close} class="ms-auto d-flex align-item-center">
                    <span class="fw-bold">{trans.t("general.cancel")}</span>
                </div>
            </div>
        )
    }
})