import { useSettings } from "@/hooks/settings";
import { defineComponent, computed, ref, PropType, onMounted, nextTick, ComponentPublicInstance } from "vue";
import { useRouter } from "vue-router";
import { useQuranReader } from "@/hooks/quran-reader";
import { ChapterInfo, Chapters, Verses, LocaleCode } from "@/types";
import { UseMemoizeReturn } from "@vueuse/core";
import sleep from "@/helpers/sleep";
import Banner from "./Banner";
import collect from "collect.js";
import InfiniteLoading from "v3-infinite-loading";
import Button from "@/components/Button/Button";
import VerseSkeleton from "./VersesSkeleton";
import Verse from "./Verses";

interface Getters {
    VERSE: UseMemoizeReturn<Promise<Verses[]>, [id: number, locale: LocaleCode]>
    INFO: UseMemoizeReturn<Promise<ChapterInfo>, [id: number, locale: LocaleCode]>
}

interface Paginate {
    totalPage: number
    currentPage: number
    data: Verses[]
}

interface Refs extends ComponentPublicInstance {
    setVisible: (visible: boolean) => void,
    getKey: () => string
}

export default defineComponent({
    props: {
        chapter: {
            type: Object as PropType<Chapters>,
            required: true
        },
        getters: {
            type: Object as PropType<Getters>,
            required: true
        }
    },
    emits: {
        loaded: (context: {firstPage: number}) => true
    },
    async setup(props, {expose, emit}) {
        const { translateMode } = useQuranReader();
        const setting = useSettings();
        const router = useRouter();
        const root = ref<HTMLElement | null>(null);
        const chapterInfo = ref<ChapterInfo>();
        const collection = ref<Verses[][]>([]);
        const paginate = ref<Paginate>({
            totalPage: 0,
            currentPage: 1,
            data: []
        });
        const sizes = ref<Record<string, number>>({});
        const versesRef = ref<Refs[]>([]);

        const meta = computed<{ hasNextChapter: boolean, hasPrevChapter: boolean, colNumber: number }>(() => {
            const state = {
                hasNextChapter: props.chapter.id < 114,
                hasPrevChapter: props.chapter.id > 1,
                colNumber: 6
            }

            return {
                ...state,
                colNumber:  (state.hasPrevChapter && state.hasNextChapter) ? 4 : 6
            }
        });

        const data = computed<{ page: number, verses: Verses[] }[]>(() => {
            const page: any = collect(paginate.value.data)
                .groupBy(item => item.page_number)
                .items;

            return Object.keys(page).map(number => ({
                page: Number(number),
                verses: page[number].toArray()
            }))
        });

        const pages = computed<number[]>(() => {
            const page = collect(collection.value.flat())
                .groupBy(item => item.page_number)
                .items;

            return Object.keys(page).map(number => Number(number));
        });

        function nextChapter() {
            if (meta.value.hasNextChapter) {
                router.push({name: "chapter", params: {id: props.chapter.id + 1}});
            }
        }

        function prevChapter() {
            if (meta.value.hasPrevChapter) {
                router.push({name: "chapter", params: {id: props.chapter.id - 1}});
            }
        }

        function loadMore(delay: number = 200): Promise<boolean> {
            return new Promise(resolve => {
                if (paginate.value.currentPage >= paginate.value.totalPage) {
                    return resolve(false);
                }

                setTimeout(() => {
                    requestAnimationFrame(() => {
                        paginate.value.data.push(...collection.value[paginate.value.currentPage]);
                        paginate.value.currentPage++;
                        nextTick(() => {
                            return resolve(true);
                        });
                    })
                }, delay);
            })
        }

        function infiniteLoad(state: any) {
            if (paginate.value.currentPage >= paginate.value.totalPage) {
                state.complete();
            } else {
                state.loading();
                loadMore().then(() => {
                    state.loaded();
                })
            }
        }

        function scroll(offset: number): Promise<void> {
            return new Promise(resolve => {
                offset = offset - ((document.querySelector("nav.navbar") as HTMLElement)?.offsetHeight || 0) + 80;
    
                setTimeout(() => {
                    window.scrollTo(0, offset);
                    resolve();
                }, 100);
            })
        }

        /**
         * maaf metode scroll ke ayatnya aga tricky soalnya saya skil issue :(
         * --------------------------------------------------------------------------------------------------------------
         * tolong beritahu saya bagaimana cara menemukan posisi scroll ke data tertentu
         * sedangkan datanya pakai infinite scroll dan lazy load dalam artian datanya masih virtual belum berada di DOM
         * */ 

        function scrollToVerse(verseNumber: number): Promise<void> {
            return new Promise((resolve, reject) => {
                (async() => {
                    if (verseNumber <= 0 || verseNumber > props.chapter.verses_count) {
                        return reject("verse not found");
                    }
    
                    const verseKey = [props.chapter.id, verseNumber].map(String).join(":");

                    while (true) {
                        const versesWrapper: HTMLElement[] = Array.from(root.value?.querySelectorAll("[data-verse-keys]") || []);
                        const versesWrapperEl = versesWrapper.find(
                            el => (el.dataset.verseKeys?.split(",") || []).includes(verseKey)
                        )
    
                        if (!versesWrapperEl && await loadMore(0)) {
                            continue;
                        }

                        break;
                    }
    
                    nextTick(() => {
                        const currentRef = versesRef.value.find(ref => ref.getKey().split(",").includes(verseKey));
    
                        currentRef?.setVisible(true);
                        
                        nextTick(() => {
                            const verseEl = root.value?.querySelector(`[data-verse-key="${verseKey}"]`);
                            
                            if (!verseEl) {
                                return reject("verse not found");
                            }
    
                            scroll((verseEl as HTMLElement).offsetTop).then(resolve);
                        })
                    })
                })()
                
            })
        }

        function scrollToPage(pageNumber: number) {
            return new Promise((resolve, reject) => {
                (async() => {
                    if (!pages.value.includes(pageNumber)) {
                        return reject("page not found");
                    }

                    while (!data.value.find(row => row.page == pageNumber) && await loadMore(0)) {
                        //
                    }

                    nextTick(() => {
                        const pageEl = root.value?.querySelector(`[data-page='${pageNumber}']`);

                        if (!pageEl) {
                            return reject("page not found");
                        }

                        scroll((pageEl as HTMLElement).offsetTop - 50).then(resolve);
                    })
                })();
            })
        }

        function setRef(ref: Refs) {
            nextTick(() => {
                versesRef.value.push(ref);
            })
        }

        onMounted(() => {
            emit("loaded", {firstPage: Number(data.value[0]?.page || 0)});
        });

        expose({
            scrollToVerse,
            scrollToPage
        });

        await sleep(1000);

        const [verse, info] = await Promise.all([
            props.getters.VERSE(props.chapter.id, setting.locale.value),
            props.getters.INFO(props.chapter.id, setting.locale.value)
        ]);

        chapterInfo.value = info;
        collection.value = collect(verse).chunk(30).toArray();

        paginate.value.totalPage = collection.value.length;
        paginate.value.data.push(...collection.value[0]);

        return {
            root,
            chapterInfo,
            translateMode,
            paginate,
            meta,
            data,
            sizes,
            nextChapter,
            prevChapter,
            infiniteLoad,
            scrollToPage,
            setRef
        }
    },
    render() {
        return (
            <>
                <Banner
                    chapter={this.chapter}
                    chapterInfo={this.chapterInfo!}
                />
            
                <div
                    dir={this.translateMode == "translated" ? "ltr" : "rtl"}
                    class="mb-4"
                    ref="root"
                >
                    {this.data.map((item, key) => (
                        <div key={key} data-page={item.page}>
                            {this.translateMode == "translated"
                                ? item.verses.map(verse => (<Verse
                                    key={verse.id}
                                    verses={[verse]}
                                    chapter={this.chapter}
                                    ref={(ref: any) => this.setRef(ref)} />
                                ))
                                : <Verse
                                    key={`item-${key}`}
                                    verses={item.verses}
                                    chapter={this.chapter}
                                    ref={(ref: any) => this.setRef(ref)}
                                />
                            }

                            {this.translateMode == "read" && (
                                <div class="w-100 mb-5 mt-0">
                                    <div class="d-flex justify-content-center">
                                        <Button
                                            type="default"
                                            class="fw-bold"
                                            outline
                                            onClick={() => this.scrollToPage(item.page)}
                                        >
                                            {item.page}
                                        </Button>
                                    </div>
                                    <hr class="primary" />
                                </div>
                            )}
                        </div>
                    ))}
   
                    <InfiniteLoading onInfinite={this.infiniteLoad}>
                        {{ 
                            spinner: () => (<VerseSkeleton />),
                            complete: () => (
                                <div class="row mt-2" dir="ltr">
                                    <div class="col-12 col-md-8 col-xl-6 mx-auto">
                                        <div class="row">
                                            {this.meta.hasPrevChapter && (
                                                <div class={`col-${this.meta.colNumber}`}>
                                                    <Button type="default" class="w-100 h-100" size="sm" onClick={this.prevChapter}>
                                                        {this.$t("quran-reader.prev-surah")}
                                                    </Button>
                                                </div>
                                            )}
                                            <div class={`col-${this.meta.colNumber}`}>
                                                <Button type="default" class="w-100 h-100" size="sm" onClick={() => window.scrollTo(0, 0)}>
                                                    {this.$t("quran-reader.back-top")}
                                                </Button>
                                            </div>
                                            {this.meta.hasNextChapter && (
                                                <div class={`col-${this.meta.colNumber}`}>
                                                    <Button type="default" class="w-100 h-100" size="sm" onClick={this.nextChapter}>
                                                        {this.$t("quran-reader.next-surah")}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        }}
                    </InfiniteLoading>
                </div>
            </>
        )
    }
})