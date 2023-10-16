import Card from "@/components/Card/Card";
import MainLayout from "@/components/Layout/MainLayout";
import UseTafsir, { DefaultSlotProps } from "@/components/Tafsir/UseTafsir";
import setPageTitle from "@/helpers/set-page-title";
import { defineComponent, computed } from "vue";
import { useRoute } from "vue-router";

export default defineComponent({
    setup() {
        const route = useRoute();

        const chapterId = computed<number>(() => {
            return Number(String(route.params.id).split(":")[0])
        })

        const verseNumber = computed<number>(() => {
            return Number(String(route.params.id).split(":")[1])
        });

        const tafsirSlug = computed<string>(() => {
            return String(route.params.slug);
        });

        const language = computed<string>(() => {
            return String(route.query.lang);
        });

        return {
            chapterId,
            verseNumber,
            tafsirSlug,
            language
        }
    },
    render() {
        return (
            <MainLayout>
                <UseTafsir
                    chapterId={this.chapterId}
                    verseNumber={this.verseNumber}
                    tafsirSlug={this.tafsirSlug}
                    language={this.language}
                    shouldUpdateQuery={true}
                    onChange={(chapter) => setPageTitle(`Tafsirs - ${chapter.name_simple}`)}
                >
                    {{
                        default: ({ children, hasPreviousAyah, hasNextAyah }: DefaultSlotProps) => (
                            <>
                                <Card class="mb-2">
                                    <div class="row align-items-center">
                                        <div class="col-12 col-md-4 mb-4 mb-md-0">
                                            <div class="row">
                                                <div class="col-4 col-xl-4 col-md-12 mb-md-2">
                                                    {children.selectChapter()}
                                                </div>
                                                <div class="col-4 col-xl-4 col-md-12 mb-md-2">
                                                    {children.selectAyah()}
                                                </div>
                                                <div class="col-4 col-xl-4 col-md-12">
                                                    {children.selectLanguage()}
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-12 col-md-8">
                                            {children.tafsirSwitcher()}
                                        </div>
                                    </div>
                                </Card>
                                <Card>
                                    {{
                                        default: children.mainContent,
                                        footer: () => (
                                            <div class="row d-flex justify-content-between">
                                                <div class="col-6 col-md-3">
                                                    {children.previousAyahButton({
                                                        type: hasPreviousAyah ? "primary" : "transparent",
                                                        class: "w-100",
                                                        gradient: true
                                                    })}
                                                </div>
                                                <div class="col-6 col-md-3">
                                                    {children.nextAyahButton({
                                                        type: hasNextAyah ? "primary" : "transparent",
                                                        class: "w-100",
                                                        gradient: true
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    }}
                                </Card>
                            </>
                        )
                    }}
                </UseTafsir>
            </MainLayout>
        )
    }
})