import { defineComponent, ref } from "vue";
import { useVModel } from "@vueuse/core";
import UseTafsir, { DefaultSlotProps } from "./UseTafsir";
import Modal from "../Modal/Modal";

export default defineComponent({
    props: {
        open: {
            type: Boolean,
            default: false
        },
        chapterId: {
            type: Number,
            default: 0
        },
        verseNumber: {
            type: Number,
            default: 0
        }
    },
    setup(props, { emit }) {
        const mOpen = useVModel(props, "open", emit);
        const mChapterId = useVModel(props, "chapterId", emit);
        const mVerseNumber = useVModel(props, "verseNumber", emit);
        const slug = ref<string>("");

        return {
            mOpen,
            mChapterId,
            mVerseNumber,
            slug
        }
    },
    render() {
        return (
            <UseTafsir
                v-model:chapterId={this.mChapterId}
                v-model:verseNumber={this.mVerseNumber}
                shouldUpdateQuery={this.mOpen}
            >
                {{
                    default: ({ children, hasNextAyah, hasPreviousAyah }: DefaultSlotProps) => (
                        <Modal
                            v-model={this.mOpen}
                            size="xl"
                            headerClasses="d-block"
                            footerClasses="d-block"
                            class="position-relative"
                        >
                            {{
                                header: () => (
                                    <div class="row">
                                        <div class="col-10 col-md-8">
                                            <div class="row">
                                                <div class="col-12 col-md-8 col-xl-5 d-flex">
                                                    <div class="flex-grow-1">
                                                        {children.selectChapter()}
                                                    </div>
                                                    <div class="flex-grow-1 ms-2">
                                                        {children.selectAyah()}
                                                    </div>
                                                    <div class="flex-grow-1 ms-2">
                                                        {children.selectLanguage()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-2 col-md-4 text-end d-flex align-items-center">
                                            <button
                                                type="button"
                                                class="btn-close"
                                                data-bs-dismiss="modal"
                                                aria-label="Close"
                                                onClick={() => this.mOpen = false}
                                            />
                                        </div>
                                    </div>
                                ),
                                footer: () => (
                                    <div class="row">
                                        <div class="col-6">
                                            {children.previousAyahButton({class: "w-100", type: hasPreviousAyah ? "default" : "transparent"})}
                                        </div>
                                        <div class="col-6">
                                            {children.nextAyahButton({class: "w-100", type: hasNextAyah ? "default" : "transparent"})}
                                        </div>
                                    </div>
                                ),
                                default: () => (
                                    <>
                                        <div class="mb-5">
                                            {children.tafsirSwitcher()}
                                        </div>

                                        {children.mainContent()}
                                    </>
                                )
                            }}
                        </Modal>
                    )
                }}
            </UseTafsir>
            
        )
    }
})