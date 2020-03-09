import { jsx } from "slate-hyperscript";
import { NodeTypes } from "../utils/NodeTypes";

// The normalizer also calls this function when necessary
export function emptyInlineContainer() {
    return jsx('element',
        { type: NodeTypes.INLINE_CONTAINER },
        [""])
}

// The normalizer also calls this function when necessary
export function emptyParagraph() {
    return jsx('element',
        { type: NodeTypes.P },
        [""])
}