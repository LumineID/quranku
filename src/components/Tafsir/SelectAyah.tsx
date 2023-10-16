import { useChapters } from "@/hooks/chapters";
import { useVModel } from "@vueuse/core";
import { computed, defineComponent } from "vue";
import Select from "@/components/Input/Select";

export default defineComponent({
    inheritAttrs: false,
    props: {
        chapterId: {
            type: Number,
            required: true
        }
    },
    setup(props, { emit, attrs }) {
        const chapters = useChapters();
        const value = useVModel(attrs, "modelValue", emit);

        const options = computed<({ name: string, value: string })[]>(() => {
            const chapter = chapters.find(props.chapterId);

            return Array(chapter?.verses_count || 0).fill(0).map((_, index) => ({
                value: String(index + 1),
                name: String(index + 1)
            }))
        });

        return {
            options,
            value
        }
    },
    render() {
        return (
            <Select
                options={this.options}
                v-model={this.value}
                setter={Number}
                class="text-center"
                {...this.$attrs}
            />
        )
    }
})