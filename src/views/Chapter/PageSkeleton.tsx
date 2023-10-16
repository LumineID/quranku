import { defineComponent, onMounted, PropType } from "vue";
import { Chapters } from "@/types";
import Skeleton from "@/components/Skeleton/Skeleton";
import Card from "@/components/Card/Card";
import Switcher from "@/components/QuranReader/Switcher";
import PlayAudioButton from "@/components/AudioPlayer/PlayAudioButton";
import VersesSkeleton from "./VersesSkeleton";

export default defineComponent({
    props: {
        chapter: {
            type: Object as PropType<Chapters>,
            required: true
        }
    },
    setup() {
        onMounted(() => {
            window.scrollTo(0, 0);
        });
    },
    render() {
        return (
            <>
                <Card class="shadow-md bg-primary bg-gradient text-white" headerClasses="text-center border-white">
                    {{ 
                        header: () => (
                            <>
                                <div class="d-flex justify-content-center mb-2">
                                    <Skeleton width="200px" height="40px" borderRadius="5px" />
                                </div>
                                <div class="d-flex justify-content-center mb-2">
                                    <Skeleton width="80px" height="20px" borderRadius="5px" />
                                </div>
                                <div class="d-flex justify-content-center mb-2">
                                    <Skeleton width="45px" height="45px" borderRadius="100%" />
                                </div>
                            </>
                        ),
                        default: () => (
                            <>
                                <div class="d-flex justify-content-center">
                                    <Skeleton width="280px" height="20px" borderRadius="5px" />
                                </div>
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
                    <div class="row mb-5">
                        <div class="col-10 col-md-6 col-xl-4 mx-auto">
                            <Skeleton width="100%" height="100px" borderRadius="10px" />
                        </div>
                    </div>
                )}
                
                <VersesSkeleton />
            </>
        )
    }
})