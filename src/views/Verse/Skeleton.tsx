import { useQuranReader } from "@/hooks/quran-reader";
import { defineComponent } from "vue";
import VerseSkeleton from "@/components/QuranReader/VerseSkeleton";
import Skeleton from "@/components/Skeleton/Skeleton";

export default defineComponent({
    setup() {
        const { translateMode } = useQuranReader();

        return () => {
            if (translateMode.value == "read") {
                return (
                    <div style={{ direction: "rtl" }}>
                        {[60, 75, 60, 75, 90].map((value, key) => (
                            <Skeleton
                                key={key}
                                width={`${value}%`}
                                height="20px"
                                borderRadius="5px"
                                class="mb-2"
                            />
                        ))}
                    </div>
                )
            } else {
                return (
                    <VerseSkeleton
                        showFooter={false}
                        buttons={3}
                    />
                )
            }
        }
    }
})