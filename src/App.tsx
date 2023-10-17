import { defineComponent } from "vue";
import { RouterView, useRouter } from "vue-router";
import setPageTitle from "./helpers/set-page-title";
import LoaderBook from "./components/PageLoader/Book";
import LoaderProgress from "./components/PageLoader/Progress";
import AudioPlayer from "./components/AudioPlayer/AudioPlayer";

export default defineComponent({
    setup() {
        const router = useRouter();

        router.afterEach(route => {
            if (typeof route.meta.title == "string") setPageTitle(route.meta.title);
        });
    },
    render() {
        return (
            <>
                <LoaderProgress visible={this.$state.get("LOADING_PAGE") === "progress"} />
                <LoaderBook visible={this.$state.get("LOADING_PAGE") === "book"} />
                <AudioPlayer />
                <RouterView />
            </>
        )
    }
});