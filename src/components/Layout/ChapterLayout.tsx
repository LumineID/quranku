import { PropType, defineComponent, Transition, ref, computed, watch, nextTick } from "vue";
import { Chapters } from "@/types";
import { useToggle } from "@vueuse/core";
import { useChapters } from "@/hooks/chapters";
import MainLayout from "./MainLayout";
import styles from "./QuranLayout.module.scss";
import Input from "../Input/Input";

export default defineComponent({
    emits: {
        clickAyah: (ayah: number) => true
    },
    props: {
        chapter: {
            type: Object as PropType<Chapters>,
            required: true
        },
        page: {
            type: Number,
            required: true
        },
        activeAyah: {
            type: Number
        }
    },
    setup(props) {
        const [show, toggle] = useToggle<boolean>(false);
        const chapters = useChapters();
        const search = ref<{chapter: string, ayah: number | null}>({chapter: "", ayah: null});
        const root = ref<HTMLElement | null>(null);

        const versesNumber = computed<number[]>(() => {
            return Array(props.chapter.verses_count).fill(0).map((_, index) => index+1);
        });

        const filteredChapters = computed<Chapters[]>(() => {
            return chapters.search(search.value.chapter.trim());
        });

        const filteredAyah = computed<number[]>(() => {
            return (search.value.ayah !== null && String(search.value.ayah).trim())
                ? versesNumber.value.filter(number => String(number).includes(String(search.value.ayah)))
                : versesNumber.value;
        });

        watch(() => [props.activeAyah, show.value].toString(), () => {
            nextTick(() => {
                if (props.activeAyah && root.value) {
                    const wrapper = root.value.querySelector("[data-name='ayah']");
                    if (wrapper) {
                        const el = wrapper.querySelector(`[data-ayah="${props.activeAyah}"]`);
                        if (el) {
                            wrapper.scrollTop = (el as HTMLElement).offsetTop - 400;
                        }
                    }
                    
                }
            })
        });

        watch(() => [props.chapter.id, show.value].toString(), () => {
            nextTick(() => {
                if (props.chapter.id && root.value) {
                    const wrapper = root.value.querySelector("[data-name='chapter']");
                    if (wrapper) {
                        const el = wrapper.querySelector(`[data-chapter-id='${props.chapter.id}']`);
                        if (el) {
                            wrapper.scrollTop = (el as HTMLElement).offsetTop - 400;
                        }
                    }
                    
                }
            })
        });
        
        return {
            show,
            toggle,
            search,
            filteredChapters,
            filteredAyah,
            root
        }
    },
    render() {
        return (
            <MainLayout showScrollIndicator fixed>
                {{
                    navSection: () => (
                        <div class="ps-2 pe-2">
                            <div class="d-flex justify-content-between mt-3 mb-3">
                                <div>
                                    <router-link to="/">
                                        <font-awesome-icon icon="home" style={{ fontSize: "18px" }} />
                                    </router-link>
                                    <span class="ms-1">
                                        / {this.$t("quran-reader.nav-header", {page: this.page})}
                                    </span>
                                </div>
                                <div class="cursor-pointer" onClick={() => this.toggle()}>
                                    <span>{this.chapter.name_simple}</span>
                                    <font-awesome-icon icon={this.show ? "caret-up" : "caret-down"} class="ms-2" />
                                </div>
                            </div>
                        </div>  
                    ),
                    footer: () => (
                        <Transition
                            enterActiveClass={styles.animate_in}
                            leaveActiveClass={styles.animate_out}
                            onBeforeLeave={(el) => {
                                el.classList.remove(styles.active)
                            }}
                            onAfterEnter={(el) => {
                                el.classList.add(styles.active)
                            }}
                        >
                            {this.show && (
                                <div ref="root" class={styles.container} onClick={((e: Event) => {
                                    if ((e.target as HTMLElement).classList.contains(styles.card_container)) {
                                        this.show = false
                                    }
                                })}>
                                    <div class={styles.card_container}>
                                        <div class={["card", styles.card]}>
                                            <div class={["card-header d-flex justify-content-between", styles.card_header]}>
                                                <h4 class="card-title">{this.chapter.name_simple}</h4>
                                                <div class="h-100 d-flex align-items-center">
                                                    <button class="btn-close" onClick={() => this.show = false}></button>
                                                </div>
                                            </div>
                                            <div class="card-body">
                                                <div class="row border-top">
                                                    <div class="col-8 border-end">
                                                        <div class="mb-4 mt-3">
                                                            <Input
                                                                class="text-center"
                                                                v-model={this.search.chapter}
                                                                {...{placeholder: this.$t("general.search-surah")}}
                                                            />
                                                        </div>
                                                        <div class={["hide-scrollbar", styles.list_items]} data-name="chapter">
                                                            {this.filteredChapters.length > 0 ? (
                                                                <div class="list-group">
                                                                    {this.filteredChapters.map(chapter => (
                                                                        <div
                                                                            key={chapter.id}
                                                                            data-chapter-id={chapter.id}
                                                                            class={["list-group-item list-group-item-action border-0", styles.item, {active: (this.$route.params.id as unknown) == chapter.id}]}
                                                                            onClick={() => {
                                                                                this.$router.push({name: "chapter", params: {id: chapter.id}})
                                                                            }}
                                                                        >
                                                                            <span class={"me-1 fw-bold"}>{chapter.id}</span>
                                                                            <span class="ms-1">{chapter.name_simple}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p class="font-monospace text-center">
                                                                    {this.$t("general.no-surah-to-display")}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div class="col-4">
                                                        <div class="mb-4 mt-3">
                                                            <Input
                                                                class="text-center"
                                                                v-model={this.search.ayah}
                                                                {...{placeholder: this.$t("general.search-ayah"), type: "number"}}
                                                            />
                                                        </div>
                                                        <div class={["hide-scrollbar", styles.list_items]} data-name="ayah">
                                                            {this.filteredAyah.length > 0 ? (
                                                                <div class="list-group">
                                                                    {this.filteredAyah.map(number => (
                                                                        <div
                                                                            key={number}
                                                                            data-ayah={number}
                                                                            class={["list-group-item list-group-item-action border-0", styles.item, {active: this.activeAyah === number}]}
                                                                            onClick={() => this.$emit("clickAyah", number)}
                                                                        >
                                                                            <div class="text-center">{number}</div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p class="font-monospace text-center">
                                                                    {this.$t("general.no-ayah-to-display")}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Transition>
                    ),
                    default: this.$slots.default
                }}
            </MainLayout>
        )
    }
})