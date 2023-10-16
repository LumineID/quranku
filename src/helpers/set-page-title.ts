import { config } from "@/hooks/settings";
import { useTitle } from "@vueuse/core";

export default function setPageTitle(title: string): void {
    useTitle(title, { titleTemplate: `%s | ${config.APP_NAME}`});
}