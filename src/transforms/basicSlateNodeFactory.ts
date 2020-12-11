import { Element, Text } from "slate"
import { jsx } from "slate-hyperscript"
import NodeTypes from "../utils/NodeTypes"
import { UsfmMarkers } from "../utils/UsfmMarkers"

// The normalizer also calls this function when necessary
export function emptyInlineContainer(): Element {
    return jsx("element", { type: NodeTypes.INLINE_CONTAINER }, [""])
}

// The normalizer also calls this function when necessary
export function emptyParagraph(): Element {
    return jsx("element", { type: UsfmMarkers.PARAGRAPHS.p }, [""])
}

export function verseNumber(number: string): Element {
    return jsx("element", { type: UsfmMarkers.CHAPTERS_AND_VERSES.v }, [number])
}

export function emptyVerseWithVerseNumber(num: string): Element {
    const children = [verseNumber(num), emptyInlineContainer()]
    return verseWithChildren(children)
}

export function verseWithChildren(children: Element[]): Element {
    return jsx("element", { type: NodeTypes.VERSE }, children)
}

export function textNode(text: string): Text {
    return jsx("text", text)
}
