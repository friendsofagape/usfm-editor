import { NodeTypes } from "./NodeTypes"

export class UsfmMarkers {
    static IDENTIFICATION = {
        id: "id",
        ide: "ide",
        rem: "rem",
        h: "h",
        toc: "toc",
        toca: "toca"
    }

    static TITLES_HEADINGS_LABELS = {
        mt: "mt",
        mte: "mte",
        ms: "ms",
        mr: "mr"
    }

    static SPECIAL_TEXT = {
        nd: "nd",
        bk: "bk"
    }

    static isIdentification(
        marker: string, 
        onFalse: (invalidMarker: string) => void = null
    ): boolean {
        const { pluses, baseType, number } = NodeTypes.destructureType(marker)
        const result = Object.keys(UsfmMarkers.IDENTIFICATION).includes(baseType)
        if (!result && onFalse) {
            onFalse(marker)
        }
        return result
    }
}