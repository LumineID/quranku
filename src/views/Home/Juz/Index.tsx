import { defineComponent, PropType, Suspense } from "vue";
import { Sort } from "@/types";
import Skeleton from "./Skeleton";
import Page from "./Page";

export default defineComponent({
    props: {
        sort: {
            type: String as PropType<Sort>,
            required: true
        }
    },
    render() {
        return (
            <Suspense key={this.$setting.locale}>
                {{
                    fallback: () => (<Skeleton />),
                    default: () => (<Page sort={this.sort} />)
                }}
            </Suspense>
        )
    }
})