import PlayAudioButton from "@/components/AudioPlayer/PlayAudioButton";
import Button from "@/components/Button/Button";
import Card from "@/components/Card/Card";
import Switcher from "@/components/QuranReader/Switcher";
import { ChapterInfo, Chapters } from "@/types";
import { PropType, Transition, defineComponent, ref } from "vue";

export default defineComponent({
    props: {
        chapter: {
            type: Object as PropType<Chapters>,
            required: true
        },
        chapterInfo: {
            type: Object as PropType<ChapterInfo>,
            required: true
        }
    },
    setup() {
        const showChapterInfo = ref<boolean>(false);

        return { showChapterInfo }
    },
    render() {
        return (
            <>
                <Card class="shadow-md bg-primary bg-gradient text-white" headerClasses="text-center border-white">
                    {{ 
                        header: () => (
                            <>
                                <h4 class="font-monospace">
                                    {this.chapter.name_complex}
                                </h4>
                                <p class="mb-1">
                                    {this.chapter.translated_name.name}
                                </p>
                                <Button type="transparent" onClick={() => this.showChapterInfo = !this.showChapterInfo}>
                                    <font-awesome-icon icon="info-circle" class="text-white" size="2x" />
                                </Button>
                            </>
                        ),
                        default: () => (
                            <>
                                <div class="text-center text-capitalize">
                                    <p>{this.chapter.revelation_place} - {this.chapter.verses_count} {this.$t("general.ayah")}</p>
                                </div>
                                <Transition
                                    enterActiveClass="animate__lightSpeedInLeft animate__animated"
                                >
                                    {this.showChapterInfo && (
                                        <div>
                                            {this.chapterInfo.short_text?.trim() ? (
                                                <>
                                                    <p class="text-justify">{this.chapterInfo.short_text}</p>
                                                    <div class="mt-1">
                                                        <router-link to={{name: "chapter.info", params: {id: this.$route.params.id}}} class="text-info fw-bold">
                                                            {this.$t("general.read-more")}
                                                        </router-link>
                                                    </div>
                                                </>
                                            ) : (
                                                <div class="d-flex">
                                                    <span class="me-2">{this.$t("general.surah-info-is-not-available-here")}</span>
                                                    <router-link to={{name: "chapter.info", params: {id: this.$route.params.id}}} class="text-info fw-bold">
                                                        {this.$t("general.read-here")}
                                                    </router-link>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Transition>
                            </>
                        )
                    }}
                </Card>
                <div class="row d-flex justify-content-between mb-5 mt-5">
                    <div class="col-6 col-md-4">
                        <Switcher />
                    </div>
                    <div class="col-5 col-md-2">
                        <PlayAudioButton audioId={this.chapter.id} />
                    </div>
                </div>

                {this.chapter.bismillah_pre && (
                    <div class="container-fluid d-flex justify-content-center mb-5">
                        <img class="img-fluid" src="/assets/svg/bismillah.svg" />
                    </div>
                )}
            </>
        )
    }
})