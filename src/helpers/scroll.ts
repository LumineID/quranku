export default {
    disable(el: HTMLElement = document.body) {
        el.classList.add("no-scroll");
    },
    enable(el: HTMLElement = document.body) {
        el.classList.remove("no-scroll");
    }
}