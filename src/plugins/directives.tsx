import { App } from "vue";
import holdClick from "./directives/hold-click";

export default {
    install(app: App) {
        app.directive("clickHold", holdClick);
    }
}