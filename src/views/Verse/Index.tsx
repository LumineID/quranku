import { Suspense, defineComponent, computed, watch, onErrorCaptured, ref, Transition } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuranReader } from "@/hooks/quran-reader";
import { useChapters } from "@/hooks/chapters";
import { NotFoundException } from "@/exceptions";
import MainLayout from "@/components/Layout/MainLayout";
import Page from "./Page";
import Skeleton from "./Skeleton";
import Switcher from "@/components/QuranReader/Switcher";
import Button from "@/components/Button/Button";
import TafsirModal from "@/components/Tafsir/TafsirModal";
import setPageTitle from "@/helpers/set-page-title";
import Error from "@/components/Error/Error";

export default defineComponent({
    setup() {
        const { tafsirModal } = useQuranReader();
        const router = useRouter();
        const route = useRoute();
        const error = ref<unknown>(null);

        const chapterId = computed<number>(() => {
            return Number(route.params.id);
        });

        const verseNumber = computed<number>(() => {
            return Number(route.params.verse);
        })

        function back() {
            router.push({name: "chapter", params: {id: chapterId.value}});
        }

        onErrorCaptured((e) => {
            error.value = e;
        });

        watch(chapterId, (id) => {
            const chapter = useChapters().find(id);
            if (chapter) setPageTitle(`Ayah ${verseNumber.value} - ${chapter.name_simple}`);
        }, { immediate: true })

        return {
            verseNumber,
            chapterId,
            tafsirModal,
            error,
            back
        }
    },
    render() {
        return (
            <>
                <TafsirModal
                    v-model:open={this.tafsirModal.isOpen}
                    v-model:chapterId={this.tafsirModal.chapterId}
                    v-model:verseNumber={this.tafsirModal.verseNumber}
                />

                <MainLayout>
                    <Transition
                        enterActiveClass="animate__animated animate__fadeInDown"
                        leaveActiveClass="animate__animated animate__fadeOut"
                        mode="out-in"
                    >
                        {this.error instanceof NotFoundException ? (
                            <Error
                                title="Whoops!!"
                                description={this.$t(this.error.message)}
                                buttons={[
                                    { label: this.$t("general.back-to-surah"), click: this.back, props: { type: "primary", class: "w-100" } }
                                ]}
                            />
                        ) : (
                            <div>
                                <div class="row mb-5">
                                    <div class="col-6 col-md-8 col-xl-10">
                                        <Button
                                            type="primary"
                                            size="sm"
                                            class="h-100"
                                            onClick={this.back}
                                            gradient
                                        >
                                            <font-awesome-icon icon="arrow-left" class="me-2" /> {this.$t("general.back-to-surah")}
                                        </Button>
                                    </div>
                                    <div class="col-6 col-md-4 col-xl-2">
                                        <Switcher />
                                    </div>
                                </div>
                                <Suspense>
                                    {{
                                        fallback: () => (
                                            <Skeleton />
                                        ),
                                        default: () => (
                                            <Page
                                                chapterId={this.chapterId}
                                                verseNumber={this.verseNumber}
                                            />
                                        )
                                    }}
                                </Suspense>
                            </div>
                        )}
                    </Transition>
                    
                    
                </MainLayout>
            </>
            
        )
    }
})