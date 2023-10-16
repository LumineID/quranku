import { defineComponent } from "vue";
import { useQuranReader } from "@/hooks/quran-reader";
import VerseSkeleton from "@/components/QuranReader/VerseSkeleton";
import Skeleton from "@/components/Skeleton/Skeleton";

export default defineComponent({
    setup() {
        const { translateMode } = useQuranReader();

        return () => {
            if (translateMode.value == "translated") {
                return Array(5).fill(0).map((_, index) => (
                    <VerseSkeleton key={index} buttons={4} class="mb-4" />
                ))
            } else {
                return Array(20).fill(0).map((_, index) => (
                    <Skeleton key={index} width="100%" height="20px" borderRadius="5px" class="mb-2" />
                ))
            }
        }
    }
})