import { PropClasses } from "@/types";
import { PropType, defineComponent } from "vue";

type Image = {src: string, alt?: string}

export default defineComponent({
    props: {
        headerClasses: {
			type: [String, Array] as PropType<PropClasses>,
		},
		bodyClasses: {
			type: [String, Array] as PropType<PropClasses>,
		},
		footerClasses: {
			type: [String, Array] as PropType<PropClasses>,
		},
		imgTop: {
			type: Object as PropType<Image>
		}
    },
    render() {
        return (
            <>
                <div class="card" {...this.$attrs}>
                    {this.imgTop && (
                        <img src={this.imgTop.src} class="card-img-top" alt={this.imgTop.alt} />
                    )}
                    {this.$slots.header && (
                        <div class={["card-header", this.headerClasses]}>
                            {this.$slots.header()}
                        </div>
                    )}
                    {this.$slots.default && (
                        <div class={["card-body", this.bodyClasses]}>
                            {this.$slots.default()}
                        </div>
                    )}
                    {this.$slots.footer && (
                        <div class={["card-footer", this.footerClasses]}>
                            {this.$slots.footer()}
                        </div>
                    )}
                </div>
            </>
        )
    }
})