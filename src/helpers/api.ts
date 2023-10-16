import { config } from "../hooks/settings";
import { useHttp } from "../hooks/http";
import { AxiosResponse } from "axios";
import { Locale } from "../hooks/settings";
import { ChapterInfo, TafsirsData, Verses, Tafsirs } from "@/types";

interface MakeParamsReturn {
    fields: string,
    translation_fields: string,
    word_fields: string
}

interface MakeParams {
    translations?: number,
    locale?: string,
    per_page?: number,
    words?: boolean
}

const http = useHttp();
const translations: Record<string, number> = {
    id: 33,
    en: 131
}

const makeParams = <T = Record<string, any>>(params: T): MakeParamsReturn & T => {
    return {
        fields: "text_uthmani",
        translation_fields: "language_id",
        word_fields: ["location", "text_uthmani"].join(","),
        ...params
    }
}

export const makeUrl = (path: string): string => {
    const prefix = config.API_PREFIX.replace(/[\\/]+$/, "");
    path = path.replace(/^[\\/]+/, "");

    return [prefix, path].join("/");
}

export const getVerseByChapter = (id: number, locale: Locale = "id"): Promise<Verses[]> => new Promise((resolve, reject) => {
    const params = makeParams<MakeParams>({
        translations: translations[locale],
        locale: locale,
        per_page: 286,
        words: true
    })
    http.get<{ verses: Verses[] }>(makeUrl(`/verses/by_chapter/${id}`), { params })
        .then(response => resolve(response.data.verses))
        .catch(reject)
});

export const getVerseByJuz = (id: number, locale: Locale = "id"): Promise<AxiosResponse> => new Promise((resolve, reject) => {
    const params = makeParams({
        translations: translations[locale],
        locale: locale,
        per_page: 286,
        words: true
    })
    http.get(makeUrl(`/verses/by_juz/${id}`), { params })
        .then((response: AxiosResponse) => resolve(response.data))
        .catch(reject)
});

export const getVerseByKey = (key: string, locale: Locale = "id"): Promise<Verses> => new Promise((resolve, reject) => {
    const params = makeParams({
        translations: translations[locale],
        locale: locale,
        per_page: 1,
        words: true
    })
    http.get<{ verse: Verses }>(makeUrl(`/verses/by_key/${key}`), { params })
        .then(response => resolve(response.data.verse))
        .catch(reject)
});

export const getChapterInfo = (id: number, locale: Locale = "id"): Promise<ChapterInfo> => new Promise((resolve, reject) => {
    const params = {
        language: locale
    }
    http.get<{ chapter_info: ChapterInfo }>(makeUrl(`chapters/${id}/info`), { params })
        .then(response => resolve(response.data.chapter_info))
        .catch(reject)
});

export const getTafsirByAyah = (id: string, slug: string, locale: Locale = "id"): Promise<TafsirsData> => new Promise((resolve, reject) => {
    const params = {
        locale: locale,
        words: true,
        mushaf: 7,
        word_fields: [
            "verse_key",
            "verse_id",
            "page_number",
            "location",
            "text_uthmani",
            "code_v1",
            "qpc_uthmani_hafs"
        ].join(",")
    }

    http.get<{ tafsir: TafsirsData }>(`https://api.qurancdn.com/api/qdc/tafsirs/${slug}/by_ayah/${id}`, { params })
        .then(response => resolve(response.data.tafsir))
        .catch(reject);
});

export const getTafsir = (): Promise<Tafsirs[]> => new Promise((resolve, reject) => {
    http.get<{ tafsirs: Tafsirs[] }>(makeUrl("resources/tafsirs"))
        .then(response => resolve(response.data.tafsirs))
        .catch(reject);
});

export default {
    makeParams,
    makeUrl,
    getVerseByChapter,
    getVerseByJuz,
    getVerseByKey,
    getChapterInfo,
    getTafsirByAyah,
    getTafsir
}