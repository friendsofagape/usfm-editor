import MarkerInfoMap from "./MarkerInfoMap"
import { Node } from "slate"

export type StyleType = 'paragraph' | 'character' | 'note' | 'milestone'

export interface MarkerInfo {
    endMarker: string
    styleType: StyleType
    occursUnder: string[],
    rank: number
}

/**
 * The order of the identification markers listed here is the 
 * order that they should appear in the usfm document. 
 * The sort order is calculated using the ordering of the enum 
 * values here.
 */
enum IDENTIFICATION {
    id = "id",
    ide = "ide",
    h = "h",
    toc = "toc",
    toca = "toca",
    rem = "rem",
    usfm = "usfm",
}

enum TITLES_HEADINGS_LABELS {
    mt = "mt",
    mte = "mte",
    ms = "ms",
    mr = "mr",
    s = "s",
    sr = "sr",
    r = "r",
    rq = "rq",
    d = "d",
    sp = "sp",
    sd = "sd",
}

enum PARAGRAPHS {
    p = "p"
}

enum SPECIAL_TEXT {
    nd = "nd",
    bk = "bk",
}

enum SPECIAL_FEATURES {
    w = "w"
}

enum CHAPTERS_AND_VERSES {
    c = "c",
    v = "v",
}

const chapterAndVerseNumbers = [
    CHAPTERS_AND_VERSES.c,
    CHAPTERS_AND_VERSES.v
]

const markerToCategoryMap: Map<string, Object> = (() => {
    const categories = [
        IDENTIFICATION,
        TITLES_HEADINGS_LABELS,
        PARAGRAPHS,
        SPECIAL_TEXT,
        SPECIAL_FEATURES,
        CHAPTERS_AND_VERSES
    ]
    return new Map<string, object>(
        // @ts-ignore
        categories.flatMap(e => Object.entries(e).map(v => [v[0], e]))
    )
})()

export class UsfmMarkers {
    /** https://ubsicap.github.io/usfm/identification */
    static IDENTIFICATION = IDENTIFICATION

    /** https://ubsicap.github.io/usfm/titles_headings */
    static TITLES_HEADINGS_LABELS = TITLES_HEADINGS_LABELS

    /**
     * Paragraph markers, including poetry-indentation.
     * https://ubsicap.github.io/usfm/paragraphs
     */
    static PARAGRAPHS = PARAGRAPHS

    /**
     * Character markers that have semantic meaning.
     * https://ubsicap.github.io/usfm/characters#special-text
     */
    static SPECIAL_TEXT = SPECIAL_TEXT

    /** https://ubsicap.github.io/usfm/titles_headings */
    static SPECIAL_FEATURES = SPECIAL_FEATURES

    /** https://ubsicap.github.io/usfm/chapters_verses */
    static CHAPTERS_AND_VERSES = CHAPTERS_AND_VERSES

    static compare(markerA: string, markerB: string): number {
        const baseMarkerA = UsfmMarkers.getBaseMarker(markerA)
        const baseMarkerB = UsfmMarkers.getBaseMarker(markerB)
        if (markerToCategoryMap.get(baseMarkerA) != 
            markerToCategoryMap.get(baseMarkerB)
        ) {
            console.warn(
                "Comparing two markers from different categories!",
                markerA, 
                markerB
            )
        }
        const sortA = UsfmMarkers.getSortOrder(markerA)
        const sortB = UsfmMarkers.getSortOrder(markerB)
        return sortA - sortB
    }

    static isIdentification(markerOrNode: string | Node): boolean {
        return UsfmMarkers.isOfCategory(markerOrNode, UsfmMarkers.IDENTIFICATION)
    }

    static isVerseOrChapterNumber(markerOrNode: string | Node): boolean {
        return UsfmMarkers.isOfCategory(markerOrNode, chapterAndVerseNumbers)
    }

    static isParagraphType(marker: string): boolean {
        switch (marker) {
            case "s5":
            case "ts-s":
            case "ts-e":
                return true // Special cases
            default:
                const info = MarkerInfoMap.get(marker)
                return info &&
                    info.styleType === 'paragraph'
        }
    }

    static isValid(marker: string): boolean {
        return MarkerInfoMap.has(marker) || marker === "s5"
    }

    static destructureMarker(marker: string) {
        if (UsfmMarkers.isNumberedMilestoneMarker(marker)) {
            const [, number, suffix] = marker.match(/^qt(\d*)(.*)$/)
            const pluses = ""
            const baseMarker = `qt${suffix}`
            const markerWithoutLeadingPlus = baseMarker + number
            return { pluses, baseMarker, number, markerWithoutLeadingPlus };
        }
        const [, pluses, baseMarker, number] = marker.match(/^(\+*)(.*?)(\d*)$/);
        const markerWithoutLeadingPlus = baseMarker + number
        return { pluses, baseMarker, number, markerWithoutLeadingPlus };
    }

    static getBaseMarker(marker: string): string {
        const { baseMarker } = UsfmMarkers.destructureMarker(marker)
        return baseMarker
    }

    private static isNumberedMilestoneMarker(marker: string): boolean {
        return (/^qt(\d*)(-[se])$/).test(marker)
    }

    /**
     * The sort order is calculated using the ordering of the markers
     * in their category enum, as well as the number of the marker,
     * if applicable. For example, "toc1" should occur before "toc2".
     */
    private static getSortOrder(marker: string): number {
        const { pluses, baseMarker, number } = UsfmMarkers.destructureMarker(marker)
        const markerCategory = markerToCategoryMap.get(baseMarker)
        const baseOrder = Object.keys(markerCategory).indexOf(baseMarker)
        if (parseInt(number)) {
            return baseOrder + (parseInt(number) * 0.1)
        }
        return baseOrder
    }

    private static isOfCategory(
        markerOrNode: string | Node, 
        category: Object | Array<string>
    ): boolean {
        const marker = UsfmMarkers.marker(markerOrNode)
        if (!marker) return false
        const baseType = UsfmMarkers.getBaseMarker(marker)
        return category.hasOwnProperty(baseType) || 
            Array.isArray(category) && category.includes(baseType)
    }

    private static marker(markerOrNode: string | Node): string {
        if (isStringOrNil(markerOrNode)) return markerOrNode
        if (isStringOrNil(markerOrNode.type)) return markerOrNode.type
        return null
    }
}

/** True iff string or null or undefined (which are all subtypes of string) */
function isStringOrNil(s: any): s is string {
    return s === null || s === undefined || typeof s === "string"
}
