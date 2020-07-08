import { NodeTypes } from "./NodeTypes"

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
    rem = "rem"
}

enum TITLES_HEADINGS_LABELS {
    mt = "mt",
    mte = "mte",
    ms = "ms",
    mr = "mr"
}

enum SPECIAL_TEXT {
    nd = "nd",
    bk = "bk",
}

/**
 * If a marker must have an associated number, it will appear in
 * this map. A marker that is allowed to have any number will be
 * paired with an empty array.
 */
const allowedNumbers = new Map<string, Array<number>>([
    [IDENTIFICATION.toc, [1, 2, 3]],
    [IDENTIFICATION.toca, [1, 2, 3]],
    [TITLES_HEADINGS_LABELS.mt, []],
    [TITLES_HEADINGS_LABELS.mte, []],
    [TITLES_HEADINGS_LABELS.ms, []]
])

const markerToCategoryMap: Map<string, Object> = (() => {
    const map = new Map<string, Object>()
    const categories = [
        IDENTIFICATION,
        TITLES_HEADINGS_LABELS,
        SPECIAL_TEXT
    ]
    //@ts-ignore
    categories.map(e => Object.entries(e).map(v => [v[0], e])).flat()
        .forEach(([marker, category]) => {
            map.set(marker, category)
        });
    return map
})()

export class UsfmMarkers {
    static IDENTIFICATION = IDENTIFICATION
    static TITLES_HEADINGS_LABELS = TITLES_HEADINGS_LABELS
    static SPECIAL_TEXT = SPECIAL_TEXT

    static compare(markerA: string, markerB: string): number {
        const baseTypeA = NodeTypes.getBaseType(markerA)
        const baseTypeB = NodeTypes.getBaseType(markerB)
        if (markerToCategoryMap.get(baseTypeA) != 
            markerToCategoryMap.get(baseTypeB)
        ) {
            console.warn(
                "Comparing two markers from different categories!",
                markerA, 
                markerB
            )
        }
        const sortA = this.getSortOrder(markerA)
        const sortB = this.getSortOrder(markerB)
        return sortA - sortB
    }

    static isIdentification(marker: string): boolean {
        return this.isOfCategory(marker, UsfmMarkers.IDENTIFICATION)
    }

    static isMarkerNumberValid(marker: string): boolean {
        if (marker == null) return false
        const { pluses, baseType, number } = NodeTypes.destructureType(marker)
        const numberInt = parseInt(number)
        if (numberInt) {
            const allowed = allowedNumbers.get(baseType)
            return allowed && (
                allowed.length == 0 ||
                allowed.includes(numberInt)
            )
        }
        return !allowedNumbers.has(baseType)
    }

    /**
     * The sort order is calculated using the ordering of the markers
     * in their category enum, as well as the number of the marker,
     * if applicable. For example, "toc1" should occur before "toc2".
     */
    private static getSortOrder(marker: string): number {
        const { pluses, baseType, number } = NodeTypes.destructureType(marker)
        const markerCategory = markerToCategoryMap.get(baseType)
        const baseOrder = Object.keys(markerCategory).indexOf(baseType)
        if (parseInt(number)) {
            return baseOrder + (parseInt(number) * 0.1)
        }
        return baseOrder
    }

    private static isOfCategory(marker: string, category: Object): boolean {
        if (marker == null) return false
        const baseType = NodeTypes.getBaseType(marker)
        return category.hasOwnProperty(baseType)
    }
}