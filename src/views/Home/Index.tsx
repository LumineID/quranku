import { computed, defineComponent, h } from "vue";
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useLocalStorage } from "@/hooks/storage";
import { useChapters } from "@/hooks/chapters";
import { useI18n } from "vue-i18n";
import { Bookmarks, Sort } from "@/types";
import MainLayout from "@/components/Layout/MainLayout";
import Card from "@/components/Card/Card";
import Button from "@/components/Button/Button";
import Tooltip from "@/components/Tooltip/Tooltip";
import Badge from "@/components/Badge/Badge";
import Surah from "./Surah/Index";
import Juz from "./Juz/Index";
import historyReplaceState from "@/helpers/history-replace-state";
import collect from "collect.js";
import toast from "@/lib/toast";

type Tab = "surah" | "juz";

export default defineComponent({
    setup() {
        const route = useRoute();
        const storage = useLocalStorage();
        const chapters = useChapters();
        const trans = useI18n();
        const tab = ref<Tab>("surah");
        const sort = ref<Sort>("asc");
        const isDeletingBookmark = ref<boolean>(false);

        const bookmarks = computed<Bookmarks[]>(() => {
            const bookmark = storage.get("BOOKMARK", {});

            return collect(Object.keys(bookmark)).map(verse => {
                const chapterNumber = Number(verse.split(":")[0]);
                let chapter = null;

                if (!isNaN(chapterNumber) && (chapter = chapters.find(chapterNumber))) {
                    return {
                        id: verse.split(":")[0],
                        verse: verse.split(":")[1],
                        verse_key: verse,
                        name: chapter.name_simple,
                        created_at: bookmark[verse]
                    }
                }
            }).filter(item => item?.created_at !== undefined).sortByDesc((item: Bookmarks) => item.created_at).toArray();
        });

        if (["surah", "juz"].includes(route.query.tab as string)) {
            tab.value = route.query.tab as Tab;
        }

        watch(tab, (value) => {
            historyReplaceState(null, {tab: value})
        });

        function deleteAllBookmark() {
            toast.confirm(trans.t("general.deleting-bookmark"), {
                onOpen: () => {
                    isDeletingBookmark.value = true;
                }
			}).then(({isConfirmed}) => {
                isDeletingBookmark.value = false;
				if (isConfirmed) {
					storage.set("BOOKMARK", {});
				}
			})
        }

        function deleteBookmark(key: string) {
            storage.set("BOOKMARK", (bookmark: Record<string, any> = {}) => {
                delete bookmark[key];
                return bookmark;
            })
        }

        return {
            tab,
            sort,
            bookmarks,
            deleteAllBookmark,
            deleteBookmark,
            isDeletingBookmark
        }
    },
    render() {
        return (
            <>
                <MainLayout>
                    <Card class="mb-4 bg-primary bg-gradient text-white" headerClasses="d-flex justify-content-between">
                        {{ 
                            header: () => (
                                <>
                                    <div class="card-title my-auto">
                                        <font-awesome-icon icon="bookmark" class="me-2"/>
                                        <span>{this.$t("general.bookmark")}</span>
                                    </div>
                                    {this.bookmarks.length > 0 && (
                                        <Button
                                            type="transparent"
                                            class="text-white"
                                            onClick={this.deleteAllBookmark}
                                            disabled={this.isDeletingBookmark}
                                        >
                                            <Tooltip title={this.$t("general.delete-bookmark").toLocaleLowerCase()}>
                                                <font-awesome-icon icon="trash" />
                                            </Tooltip>
                                        </Button>
                                    )}
                                </>
                            ),
                            default: () => (
                                <>
                                    {this.bookmarks.length > 0 ? (
                                        <div class="row custom-scrollbar" style="overflow-x: hidden; max-height: 200px">
                                            {this.bookmarks.map(item => (
                                                <div key={item.id} class="col-6 col-ms-4 col-md-3 col-xl-2">
                                                    <Badge
                                                        type="body-tertiary"
                                                        tag="div"
                                                        class={["m-1 p-3 w-100 d-inline-flex align-items-center cursor-pointer", {"text-dark": !this.$setting.isDarkMode}]}
                                                    >
                                                        <Tooltip title={this.$t("general.delete").toLocaleLowerCase()}>
                                                            <font-awesome-icon
                                                                icon="times"
                                                                class="me-2 border-end pe-2"
                                                                style={{fontSize: "15px"}}
                                                                onClick={() => this.deleteBookmark(item.verse_key)}
                                                            />
                                                        </Tooltip>
                                                        <router-link to={{name: "chapter.verse", params: {id: item.id, verse: item.verse}}}>
                                                            <span class="text-truncate"><span class="me-2 border-end pe-2">{item.verse_key}</span>{item.name}</span>
                                                        </router-link>
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div class="text-center">
                                            <span class="me-4">{this.$t("general.click-icon")}</span>
                                            <font-awesome-icon icon="bookmark" />
                                            <span class="ms-4">{this.$t("general.to-add")}</span>
                                        </div>
                                    )}
                                </>
                            )
                         }}
                    </Card>
                    <div class="d-flex justify-content-between mb-3">
                        <ul class="nav nav-pills mb-3">
                            <li class="nav-item" onClick={() => this.tab = "surah"}>
                                <div class={["nav-link cursor-pointer", {active: this.tab == "surah"}]}>
                                    {this.$t("general.surah")}
                                </div>
                            </li>
                            <li class="nav-item" onClick={() => this.tab = "juz"}>
                                <div class={["nav-link cursor-pointer", {active: this.tab == "juz"}]}>
                                    {this.$t("general.juz")}
                                </div>
                            </li>
                        </ul>
                        <div class="my-auto">
                            <small>
                                <span class="me-2">{this.$t("sort.by")}:</span>
                                <span class="text-primary cursor-pointer" onClick={() => {
                                    this.sort = this.sort == "desc" ? "asc" : "desc"
                                }}>
                                    <span class="text-uppercase">
                                        {this.$t(`sort.${this.sort}`)}
                                    </span>
                                    <font-awesome-icon icon={this.sort == "desc" ? "caret-down" : "caret-up"} class="ms-1" />
                                </span>
                            </small>
                        </div>
                    </div>
                    {h(this.tab == "surah" ? Surah : Juz, {sort: this.sort})}
                </MainLayout>
            </>
        )
    }
})