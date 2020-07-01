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

    static isIdentification(marker: string): boolean {
        if (marker == null) return false
        const { pluses, baseType, number } = NodeTypes.destructureType(marker)
        return Object.keys(UsfmMarkers.IDENTIFICATION).includes(baseType)
    }
}