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

export function verseNumber(number) {
    return jsx('element',
        { type: NodeTypes.VERSE_NUMBER },
        [number]
    )
}

export function emptyVerseWithVerseNumber(num) {
    const children = [
        verseNumber(num),
        emptyInlineContainer()
    ]
    return verseWithChildren(children)
}

export function verseWithChildren(children) {
    return jsx('element',
        { type: NodeTypes.VERSE },
        children
    )
}

export function textNode(text) {
    return jsx('text', text)
}
