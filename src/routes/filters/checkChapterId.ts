import { useChapters } from "@/hooks/chapters"
import { Context } from "./types"

export default () => (ctx: Context) => {
    if (!useChapters().find(Number(ctx.to.params.id))) {
        return ctx.next("/error");
    } else {
        return ctx.next();
    }
}