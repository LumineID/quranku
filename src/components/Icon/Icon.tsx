import { defineComponent, h, PropType } from "vue";
import IconClock from "./icon/clock.svg?component";
import IconStarsIslamic from "./icon/stars-islamic.svg?component";
import IconHome from "./icon/home.svg?component";
import IconRotate from "./icon/rotate.svg?component";
import Bismillah from "./icon/bismillah.svg?component";

const Icons: Record<string, any> = {
    "clock": IconClock,
    "stars-islamic": IconStarsIslamic,
    "home": IconHome,
    "rotate": IconRotate,
    "bismillah": Bismillah
}

type Name =
    | "clock"
    | "stars-islamic"
    | "home"
    | "rotate"
    | "bismillah"

export default defineComponent({
    props: {
        width: {
            type: [Number, String]
        },
        height: {
            type: [Number, String]
        },
        name: {
            type: String as PropType<Name>,
            required: true
        }
    },
    render() {
        const component = Icons[this.name];

        if (!component) throw new Error(`Icon ${this.name} is not found`);

        return h(component, {
            width: this.width,
            height: this.height,
            ...this.$attrs
        })
    }
})