import { defineComponent, ref, onMounted, Teleport, computed, watch, Transition } from "vue";
import { useEventListener } from "@vueuse/core";
import { useState } from "@/hooks/state";
import styles from "./Layout.module.scss";
import fullscreen from "@/helpers/fullscreen";
import Tooltip from "@/components/Tooltip/Tooltip";
import Setting from "./Setting";
import SearchChapters from "./SearchChapters";
import { useRouter } from "vue-router";

const SIDBAR_MENU: Array<{ icon: string, label: string, route: string }> = [
    {
        icon: "/assets/svg/home.svg",
        label: "general.home-page",
        route: "home"
    },
    {
        icon: "/assets/svg/clock.svg",
        label: "general.prayer-schedule",
        route: "prayer-schedule"
    }
]

export default defineComponent({
    props: {
        fixed: {
            type: Boolean,
            default: false
        },
        showScrollIndicator: {
            type: Boolean,
            default: false
        }
    },
    setup(props) {
        const state = useState();
        const router = useRouter();
        const isFullscreen = ref<boolean>(fullscreen.isFullscreen());
        const scrollProgress = ref<number>(0);
        const navbar = ref<HTMLElement | null>(null);
        const showSetting = ref<boolean>(false);
        const showSearchChapters = ref<boolean>(false);

        fullscreen.onFullscreenChange((isFs: boolean) => {
            isFullscreen.value = isFs;
        });

        const showSidebar = computed<boolean>({
            set(value) {
                state.set("SHOW_SIDEBAR", value)
            },
            get() {
                return state.get("SHOW_SIDEBAR", false);
            }
        });

        let oldScroll: number = 0;

        function handleScroll() {
            if (props.showScrollIndicator) {
                let width = 100;
                const scrollHeight = document.documentElement.scrollHeight;
                const clientHeight = document.documentElement.clientHeight;
                const navbarHeight = (navbar.value?.offsetHeight || 0);

                if ((scrollHeight - clientHeight) >= 1) {
                    width = ((window.scrollY / (scrollHeight - clientHeight - navbarHeight - 30)) * 100)
                }

                scrollProgress.value = width;
            }

            if (props.fixed) {
                if (oldScroll - window.scrollY < 0) {
                    navbar.value?.classList.add(styles.navbar_minimize);
                    document.body.setAttribute("data-navbar-minimize", "true");
                } else {
                    navbar.value?.classList.remove(styles.navbar_minimize);
                    document.body.removeAttribute("data-navbar-minimize");
                }
            }

            oldScroll = window.scrollY;
        }

        function gotoRoute(name: string) {
            router.push({ name }).then(() => {
                setTimeout(() => showSidebar.value = false, 100);
            });
        }

        onMounted(() => {
            useEventListener(window, "scroll", handleScroll)
        });

        watch(showSidebar, (isShown) => {
            if (isShown) {
                document.body.classList.add("sidebar-open");
            } else {
                document.body.classList.remove("sidebar-open");
            }
        });

        return {
            isFullscreen,
            scrollProgress,
            navbar,
            showSetting,
            showSearchChapters,
            showSidebar,
            gotoRoute
        }
    },
    render() {
        return (
            <>
                <nav class={["sidebar", {close: !this.showSidebar}]}>
                    <ul class="sidebar-menu">
                        {SIDBAR_MENU.map((item, key) => (
                            <li
                                key={key}
                                class={["menu-link", { active: this.$route.name == item.route }]}
                                onClick={() => this.gotoRoute(item.route)}
                            >
                                <div>
                                    <div class="menu-link-icon">
                                        <img src={item.icon} />
                                    </div>
                                    <div class="menu-link-text">
                                        {this.$t(item.label)}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </nav>
                <nav ref="navbar" class={[
                    "navbar",
                    styles.navbar,
                    this.$setting.isDarkMode ? "bg-body-tertiary" : "bg-white",
                    {"sticky-top": this.fixed}
                ]}>
                    <div class="container-fluid">
                        <div class="vw-100">
                            <div class="ps-1 pe-1">
                                <div class="d-flex align-items-center justify-content-between mb-2">
                                    <div class="d-flex align-items-center h-100">
                                        <div class={["me-1", styles.nav_menu_item]} onClick={() => this.showSidebar = !this.showSidebar}>
                                            <Transition
                                                enterActiveClass="animate__animated animate__rubberBand"
                                                leaveActiveClass="animate__animated animate__bounceOut"
                                                mode="out-in"
                                            >
                                                {this.showSidebar ? (
                                                    <font-awesome-icon key={0} icon="bars-staggered" class={styles.icon} style="--animate-duration: .2s" />
                                                ) : (
                                                    <font-awesome-icon key={1} icon="bars" class={styles.icon} style="--animate-duration: .4s" />
                                                )}
                                            </Transition>
                                        </div>
                                        <div class={styles.nav_app_logo}>
                                            <img src="/assets/img/logo.png" alt={this.$config.APP_NAME} />
                                        </div>
                                    </div>
                                    <div>
                                        <div class="d-flex">
                                            <div class={["me-2", styles.nav_menu_item]} onClick={fullscreen.toggle}>
                                                <Tooltip title={this.$t("general.fullscreen").toLocaleLowerCase()}>
                                                    <font-awesome-icon icon={this.isFullscreen ? "expand" : "minimize"} class={styles.icon} />
                                                </Tooltip>
                                            </div>
                                            <div class={["me-2", styles.nav_menu_item]} onClick={() => this.showSetting = true}>
                                                <Tooltip title={this.$t("general.setting").toLocaleLowerCase()}>
                                                    <font-awesome-icon icon="gear" class={styles.icon} />
                                                </Tooltip>
                                            </div>
                                            <div class={["me-0", styles.nav_menu_item]} onClick={() => this.showSearchChapters = true}>
                                                <Tooltip title={this.$t("general.search-surah").toLocaleLowerCase()}>
                                                    <font-awesome-icon icon="search" class={styles.icon} />
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {this.$slots.navSection?.()}

                                {this.showScrollIndicator && (
                                    <Teleport to="body" disabled={this.fixed}>
                                        <div class="ps-2 pe-2">
                                            <div class={["progress h-5-px", {"position-fixed sticky-top top-0 start-0 w-100 border-radius-0 z-index-1090": !this.fixed}]}>
                                                <div
                                                    class="progress-bar"
                                                    role="progressbar"
                                                    aria-valuemax="100"
                                                    aria-valuemin="0"
                                                    aria-valuenow={String(this.scrollProgress)}
                                                    style={`width: ${this.scrollProgress}%`}
                                                />
                                            </div>
                                        </div>
                                    </Teleport>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>
                <div class="main-content">
                    <div class="container-fluid mt-5">
                        {this.$slots.default?.()}
                    </div>
                </div>

                <Teleport to="body">
                    <Setting v-model:show={this.showSetting} />
                    <SearchChapters v-model:show={this.showSearchChapters} />
                </Teleport>
    
                {this.$slots.footer?.()}

            </>
        )
    }
});