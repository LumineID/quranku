import { PropType, defineComponent } from "vue";
import Button from "../Button/Button";

export default defineComponent({
    props: {
        title: {
            type: String
        },
        description: {
            type: String
        },
        buttons: {
            type: Array as PropType<Array<{ label: string, click?: (e: Event) => void, props?: Record<string, any>}>>
        }
    },
    render() {
        return (
            <div class="row pt-5">
                <div class="col-12 col-md-6 mx-auto">
                    <div class="d-flex justify-content-center">
                        <div class="text-center">
                            <div class="d-flex justify-content-center mb-4">
                                <img src="/assets/svg/undraw_donut_love_kau1.svg" width="512" class="img-fluid" />
                            </div>
                            <h1 class="fw-bold font-monospace" style={{ fontSize: "44px" }}>
                                {this.title || "Error" }
                            </h1>
                            <p class="mt-4 mb-4">
                                {this.description || "whoaps! There an error."}
                            </p>
                            <div class="row">
                                {this.buttons?.map((btn, key) => (
                                    <div class="col-6 mb-2 mx-auto">
                                        <Button key={key} onClick={btn.click} {...(btn.props || {})}>
                                            {btn.label}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
})