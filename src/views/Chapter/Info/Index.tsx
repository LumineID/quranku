import MainLayout from "@/components/Layout/MainLayout";
import Skeleton from "@/components/Skeleton/Skeleton";
import Button from "@/components/Button/Button";
import Page from "./Page";
import { defineComponent, Suspense } from "vue";

export default defineComponent({
    render() {
        return (
            <>
                <MainLayout>
                    <div class="mb-4 d-flex justify-content-center">
                        <Button
                            class="shadow-lg bg-gradient"
                            size="sm"
                            type="primary"
                            onClick={() => this.$router.push({name: "chapter", params: {id: this.$route.params.id}})}
                        >
                            <font-awesome-icon icon="arrow-left" class="me-2" /> {this.$t("general.back-to-surah")}
                        </Button>
                    </div>
                    <Suspense key={this.$setting.locale}>
                        {{ 
                            fallback: () => (
                                <>
                                    <div class="d-flex justify-content-center mb-2">
                                        <Skeleton width="200px" height="40px" borderRadius="5px" />
                                    </div>
                                    <div class="d-flex justify-content-center mb-2">
                                        <Skeleton width="80px" height="20px" borderRadius="5px" />
                                    </div>
                                    <div class="d-flex justify-content-center mb-2">
                                        <Skeleton width="280px" height="20px" borderRadius="5px" />
                                    </div>
                                    <Skeleton width="100%" height="4px" borderRadius="5px" />
                                    <div class="mt-3">
                                        <Skeleton width="100%" height="20px" class="mb-1" borderRadius="5px" />
                                        <Skeleton width="100%" height="20px" class="mb-1" borderRadius="5px" />
                                        <Skeleton width="100%" height="20px" class="mb-1" borderRadius="5px" />
                                    </div>
                                    <div class="mt-3">
                                        <Skeleton width="200px" height="30px" class="mb-1" borderRadius="5px" />
                                        <Skeleton width="100%" height="20px" class="mb-1" borderRadius="5px" />
                                        <Skeleton width="100%" height="20px" class="mb-1" borderRadius="5px" />
                                        <Skeleton width="100%" height="20px" class="mb-1" borderRadius="5px" />
                                    </div>
                                    <div class="mt-3">
                                        <Skeleton width="100%" height="20px" class="mb-1" borderRadius="5px" />
                                        <Skeleton width="100%" height="20px" class="mb-1" borderRadius="5px" />
                                        <Skeleton width="100%" height="20px" class="mb-1" borderRadius="5px" />
                                    </div>
                                    <div class="mt-3">
                                        <Skeleton width="200px" height="30px" class="mb-1" borderRadius="5px" />
                                        <Skeleton width="100%" height="20px" class="mb-1" borderRadius="5px" />
                                        <Skeleton width="100%" height="20px" class="mb-1" borderRadius="5px" />
                                        <Skeleton width="100%" height="20px" class="mb-1" borderRadius="5px" />
                                    </div>
                                    <div class="mt-3">
                                        <Skeleton width="100%" height="20px" class="mb-1" borderRadius="5px" />
                                        <Skeleton width="100%" height="20px" class="mb-1" borderRadius="5px" />
                                        <Skeleton width="100%" height="20px" class="mb-1" borderRadius="5px" />
                                    </div>
                                </>
                            ),
                            default: () => (<Page />)
                        }}
                    </Suspense>
                </MainLayout>
            </>
        )
    }
})