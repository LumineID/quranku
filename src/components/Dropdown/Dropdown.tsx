import { defineComponent, onMounted, onBeforeUnmount, ref, PropType, h } from "vue";
import { Dropdown } from "bootstrap";
import { PropClasses } from "@/types";

export default defineComponent({
    props: {
        options: {
			type: Object,
			default: () => ({})
		},
        tagMenu: {
            type: String,
            default: "div"
        },  
        menuClasses: {
            type: [String, Array] as PropType<PropClasses>
        }
    },
    setup(props) {
        const el = ref<HTMLElement | null>(null);
		const dropdown = ref<Dropdown | null>(null);

		onMounted(() => {
			dropdown.value = new Dropdown(el.value as HTMLElement, props.options);
		});

        onBeforeUnmount(() => {
            dropdown.value?.dispose();
        });

        return {
            el
        }
    },
    render() {
        return (
            <>
                <div class="dropdown">
                    <div ref="el" class="cursor-pointer" data-bs-toggle="dropdown">
                        {this.$slots.button?.()}
                    </div>
                    {
                        h(this.tagMenu, {class: ["dropdown-menu", this.menuClasses]}, this.$slots.default?.())
                    }
                </div>
            </>
        )
    }
})