import { UsfmMarkers } from "./UsfmMarkers"

/**
 * Mark types are usfm character markers (such as \nd) that appear as
 * slate marks to decorate text, like this: {text: "Lord", nd:true}
 * These are not to be confused with node types, which appear in the
 * "type" field of slate nodes.
 */
export const MarkTypes = {
    ND: UsfmMarkers.SPECIAL_TEXT.nd,
    BK: UsfmMarkers.SPECIAL_TEXT.bk
}