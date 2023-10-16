import { useHttpRetry } from "@/hooks/http";
import { defineComponent, ref, watch } from "vue";
import { Tafsirs } from "@/types";
import { getTafsir } from "@/helpers/api";
import { invoke, useVModel } from "@vueuse/core";
import collect from "collect.js";
import Skeleton from "../Skeleton/Skeleton";

export default defineComponent({
    props: {
        language: {
            type: String,
            required: true
        }
    },
    setup(props, { emit, attrs }) {
        const httpRetry = useHttpRetry();
        const value = useVModel(attrs, "modelValue", emit)
        const data = ref<Record<string, Tafsirs[]>>({});
        const options = ref<Tafsirs[]>([]);

        invoke(async() => {
            const tafsir = await httpRetry.promise(getTafsir());

            data.value = collect(tafsir).groupBy("language_name").map((item: any) => ({
                [item.items[0].language_name.toLowerCase()]: item.items
            })).toArray().reduce((obj: any, item: any) => ({...obj, ...item}), {}) as Record<string, Tafsirs[]>;

            watch(() => props.language, (language) => {
                const opt = [];
                const before = tafsir.find(tafsir => tafsir.slug == value.value);

                if (before) {
                    opt.push(before);
                }

                if (data.value[language]) {
                    opt.push(...data.value[language])
                }

                options.value = collect(opt).unique("id").toArray();
            }, { immediate: true });

            watch(value, () => {
                if (options.value.length && !options.value.find(tafsir => tafsir.slug == value.value)) {
                    value.value = options.value[0].slug;
                }
            }, { immediate: true });

            watch(value, () => {
                if (data.value[props.language]) {
                    options.value = data.value[props.language];
                }
            })
        });

        return {
            options,
            value
        }
    },
    render() {
        if (this.options.length == 0) {
            return (
                <Skeleton width="100%" height="50px" borderRadius="5px" />
            )
        } else {
            return (
                <nav class="nav nav-pills custom-nav-pills">
                    {this.options.map(tafsir => (
                        <div
                            key={tafsir.id}
                            class={["nav-link", {active: this.value == tafsir.slug}]}
                            onClick={() => this.value = tafsir.slug}
                        >
                            {tafsir.translated_name.name}
                        </div>
                    ))}
                </nav>
            )
        }
    
    }
})
