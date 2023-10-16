export default function(el: HTMLElement | Element, partiallyVisible: boolean = false): boolean {
    const rect = el.getBoundingClientRect();
    const innerHeight = (window.innerHeight || document.documentElement.clientHeight);
    const innerWidth = (window.innerWidth || document.documentElement.clientWidth);

    if (partiallyVisible) {
        return ((rect.top > 0 && rect.top < innerHeight) ||
            (rect.bottom > 0 && rect.bottom < innerHeight)) &&
            ((rect.left > 0 && rect.left < innerWidth) || (rect.right > 0 && rect.right < innerWidth))
    } else {
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= innerHeight &&
            rect.right <= innerWidth
        )
    }
}