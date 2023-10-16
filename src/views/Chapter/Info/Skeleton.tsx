import Skeleton from "@/components/Skeleton/Skeleton";
import { defineComponent } from "vue";

export default defineComponent({
    render() {
        return (
            <>
                <div class="d-flex justify-content-center mb-2">
                    <Skeleton width="200px" height="40px" borderRadius="5px" />
                </div>
                <div class="d-flex justify-content-center mb-2">
                    <Skeleton width="80px" height="20px" borderRadius="5px" />
                </div>
                <div class="d-flex justify-content-center mb-2">
                    <Skeleton width="280px" height="20px" borderRadius="5px" />
                </div>
                <Skeleton width="100%" height="4px" borderRadius="5px" />
                <div class="mt-3">
                    <Skeleton width="100%" height="20px" class="mb-1" borderRadius="5px" />
                    <Skeleton width="100%" height="20px" class="mb-1" borderRadius="5px" />
                    <Skeleton width="100%" height="20px" class="mb-1" borderRadius="5px" />
                </div>
                <div class="mt-3">
                    <Skeleton width="200px" height="30px" class="mb-1" borderRadius="5px" />
                    <Skeleton width="100%" height="20px" class="mb-1" borderRadius="5px" />
                    <Skeleton width="100%" height="20px" class="mb-1" borderRadius="5px" />
                    <Skeleton width="100%" height="20px" class="mb-1" borderRadius="5px" />
                </div>
                <div class="mt-3">
                    <Skeleton width="100%" height="20px" class="mb-1" borderRadius="5px" />
                    <Skeleton width="100%" height="20px" class="mb-1" borderRadius="5px" />
                    <Skeleton width="100%" height="20px" class="mb-1" borderRadius="5px" />
                </div>
                <div class="mt-3">
                    <Skeleton width="200px" height="30px" class="mb-1" borderRadius="5px" />
                    <Skeleton width="100%" height="20px" class="mb-1" borderRadius="5px" />
                    <Skeleton width="100%" height="20px" class="mb-1" borderRadius="5px" />
                    <Skeleton width="100%" height="20px" class="mb-1" borderRadius="5px" />
                </div>
                <div class="mt-3">
                    <Skeleton width="100%" height="20px" class="mb-1" borderRadius="5px" />
                    <Skeleton width="100%" height="20px" class="mb-1" borderRadius="5px" />
                    <Skeleton width="100%" height="20px" class="mb-1" borderRadius="5px" />
                </div>
            </>
        )
    }
})