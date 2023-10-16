import Select from "@/components/Input/Select";
import { useVModel } from "@vueuse/core";
import { defineComponent, ref, watch } from "vue";

export default defineComponent({
    setup(props, { emit, attrs }) {
        const value = useVModel(attrs, "modelValue", emit);

        const options = ref<({ name: string, value: string })[]>([{
            name: "English",
            value: "english"
        },{
            name: "বাংলা",
            value: "bengali"
        },{
            name: "العربية",
            value: "arabic"
        },{
            name: "русский",
            value: "russian"
        },{
            name: "اردو",
            value: "urdu"
        },{
            name: "Kurdî",
            value: "kurdish"
        }]);

        watch(() => attrs.modelValue, (modelValue) => {
            if (!String(modelValue).trim() || !options.value.find(item => item.value === modelValue)) {
                value.value = options.value[0].value;
            }
        }, { immediate: true });

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
                class="text-center"
            />
        )
    }
})