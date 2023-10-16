export type Sort = "asc" | "desc"
export type LocaleCode = "en" | "id"
export type PropClasses = string | Array<string | Record<string, boolean | undefined | null>>
export type PropCheckbokType = "checkbox" | "radio" | "switch"
export type PropBsSize = "sm" | "md" | "lg"
export type PropBsSizeMedium = PropBsSize | "xl"
export type PropBsSizeLarge = PropBsSizeMedium | "xxl"
export type PropBsTooltipPlacement = "top" | "bottom" | "left" | "right";
export type PropsSelectOptions = Array<{
    name: string, 
    value: string,
    selected?: boolean
}>
export type Chapters = {
    id: number,
    bismillah_pre: boolean,
    name_arabic: string,
    name_complex: string,
    name_simple: string,
    pages: number[],
    revelation_order: number,
    revelation_place: string,
    verses_count: number,
    translated_name: {
        language_name: string,
        name: string
    }
}
export type Juzs = {
    id: number,
    juz_number: number,
    first_verse_id: number,
    last_verse_id: number,
    verse_count: number,
    verse_mapping: Record<number, string>
}
export type Verses = {
    id: number,
    hizb_number: number,
    juz_number: number,
    manzil_number: number,
    page_number: number,
    rub_el_hizb_number: number,
    ruku_number: number,
    sajdah_number: number | null,
    text_uthmani: string,
    verse_number: number,
    verse_key: string,
    words: Words[],
    translations: Array<{
        id: number,
        language_id: number,
        resource_id: number,
        text: string
    }>
}
export type Words = {
    id: number,
    line_number: number,
    audio_url: string,
    char_type_name: "word" | "end",
    location: string,
    page_number: number,
    position: number,
    text: string,
    text_uthmani: string,
    translation: {
        text: string,
        language_name: string
    },
    transliteration: {
        text: string | null,
        language_name: string
    }
}
export type ChapterInfo = {
    chapter_id: number,
    id: number,
    short_text: string | null,
    source: string,
    text: string
}
export type Tafsirs = {
    id: number
    name: string
    author_name: string
    slug: string
    language_name: string
    translated_name: {
        name: string
        language_name: string
    }
}
export type TafsirsData = {
    language_id: number
    resource_id: number
    resource_name: string
    slug: string
    text: string
    translated_name: {
        name: string
        language_name: string
    }
    verses: Record<string, {
        id: number
        words: Words[]
    }>
}

enum PropsButton {
    "bookmark",
    "copy",
    "tafsir",
    "play"
}

interface AudioTimestamp {
    verse_key: string
    segments: Array<[number, number, number]>
    timestamp_from: number
    timestamp_to: number
    duration: number
}

interface AudioData {
    audio_url: string
    format: string
    id: number
    chapter_id: number
    reciter_id: number
    file_size: number
    timestamps: AudioTimestamp[]
}

export type QuranReader = {
    READ_MODE: "translated" | "read"
    PROPS_BUTTON: Array<keyof typeof PropsButton>
    TAFSIR_MODAL: {
        isOpen: boolean
        chapterId: number
        verseNumber: number
    }
}

export type AudioPlayer = {
    AUDIO_DATA: AudioData
    TIMESTAMP: AudioTimestamp
    START_AUDIO_PAYLOAD: {
        startFromSeconds?: number
        startFromAyah?: number
        success?: (data: AudioData) => void
        error?: (error: any) => void
    }
}

export type Reciters = {
    id: number
    style: string | null
    reciter_name: string
    translate_name: {
        language_name: string
        name: string
    }
}

export type Bookmarks = {
    id: number,
    verse: number,
    verse_key: string,
    name: string,
    created_at: number
}