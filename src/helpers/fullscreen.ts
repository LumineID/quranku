import fscreen from "fscreen";

const FULLSCREEN_EL: HTMLElement = document.documentElement;

const fullscreen = {
    isFullscreen() {
        return (fscreen.fullscreenElement === FULLSCREEN_EL);
    },
    enable() {
        if (!fullscreen.isFullscreen()) {
            fscreen.requestFullscreen(FULLSCREEN_EL);
        }
    },
    disable() {
        if (fullscreen.isFullscreen()) {
            fscreen.exitFullscreen();
        }
    },
    toggle() {
        if (fullscreen.isFullscreen()) {
            fullscreen.disable();
        } else {
            fullscreen.enable();
        }
    },
    onFullscreenChange(callback: (fullscreenActive: boolean) => void) {
        fscreen.onfullscreenchange = () => callback(this.isFullscreen());
    }
}

export default fullscreen