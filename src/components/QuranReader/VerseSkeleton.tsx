import { defineComponent } from "vue";
import Skeleton from "../Skeleton/Skeleton";

export default defineComponent({
    props: {
        showFooter: {
            type: Boolean,
            default: true
        },
        buttons: {
            type: Number,
            required: true
        }
    },
    render() {
        return (
            <div>
                <div class="d-md-flex">
                    <div class="d-flex d-md-block">
                        <div class="mb-0 mb-md-4 me-1 me-md-0 position-relative d-flex align-items-center text-center">
                            <Skeleton width="60px" height="60px" borderRadius="50%" />
                        </div>
                        {Array(this.buttons).fill(0).map((_, key) => (
                            <div key={key} class="mt-0 mt-md-3 ms-4 ms-md-2 d-flex align-items-center">
                                <Skeleton width="30px" height="30px" borderRadius="0.50rem" />
                            </div>
                        ))}
                    </div>
                    <div class="ms-md-4 w-100 h-100 w-100">
                        <div class="d-flex justify-content-end mt-2 mt-md-5 w-100">
                            <Skeleton width="60%" height="80px" borderRadius="0.50rem" />
                        </div>
                        <div class="mt-5 fs-md-5 my-auto">
                            <Skeleton width="80%" height="30px" borderRadius="0.50rem" />
                        </div>
                    </div>
                </div>
                {this.showFooter && <Skeleton class="mt-3" width="100%" height="5px" border-radius="0.25rem" />}
            </div>
        )
    }
})