import { createI18n, I18nOptions } from "vue-i18n";

function parseMessages(object: Record<string, any>) {
    return Object.keys(object).map(key => {
        return [key.split("/").pop()?.split(".")[0], object[key]]
    }).reduce((data: Record<string, any>, item: any) => {
        return ({...data, [item[0]]: item[1].default})
    }, {});
}

const options: I18nOptions = {
    locale: "id",
    allowComposition: true,
    legacy: true,
    warnHtmlInMessage: "off",
    messages: {
        id: parseMessages(import.meta.glob("./messages/id/*.json", { eager: true })),
        en: parseMessages(import.meta.glob("./messages/en/*.json", { eager: true }))
    }
}

export default createI18n<false, typeof options>(options);