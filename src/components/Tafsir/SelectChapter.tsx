import Select from "@/components/Input/Select";
import { useChapters } from "@/hooks/chapters";
import { useVModel } from "@vueuse/core";
import { computed, defineComponent } from "vue";

export default defineComponent({
    inheritAttrs: false,
    setup(props, { emit, attrs }) {
        const chapters = useChapters();
        const value = useVModel(attrs, "modelValue", emit);

        const options = computed<({ name: string, value: string })[]>(() => {
            return chapters.data.value.map(chapter => ({
                name: chapter.name_simple,
                value: String(chapter.id)
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