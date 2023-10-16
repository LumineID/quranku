import { defineComponent } from "vue";
import Skeleton from "../Skeleton/Skeleton";

const size = [90, 70, 80, 90, 100, 100];

export default defineComponent({
    render() {
        return (
            <>
                <div class="mb-4" style={{ direction: "rtl" }}>
                    <Skeleton width="100%" height="100px" borderRadius="5px" />
                    <Skeleton width="100%" height="5px" borderRadius="5px" class="mt-3" />
                </div>
                <div>
                    {Array(5).fill(0).map((_value, _key) => size.map((value, key) => (
                        <Skeleton key={[_key, key].toString()} width={`${value}%`} height="18px" borderRadius="5px" class="mb-2" />
                    )))}
                </div>
            </>
        )
    }
})