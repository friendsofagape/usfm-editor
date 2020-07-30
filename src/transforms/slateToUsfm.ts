import NodeTypes from "../utils/NodeTypes"
import { MyText } from "../plugins/helpers/MyText"
import { Text } from "slate"
import { UsfmMarkers }from "../utils/UsfmMarkers"
import MarkerInfoMap from "../utils/MarkerInfoMap"

export function slateToUsfm(value): string {
    const usfm = serializeRecursive(value)
    const normalized = normalizeWhitespace(usfm)
    // Convert the workaround for the pipe literal back to the pipe character
    return normalized.replace(/&pipe;/g, "|")
}

function normalizeWhitespace(usfm: string): string {
    // Remove leading newline
    usfm = usfm.replace(/^\n/, '');
    // Any whitespace ending in a newline should just be a newline
    usfm = usfm.replace(/(\s+?)\n/g, '\n');
    // Remove space at the end of the document
    usfm = usfm.replace(/(\s+)$/, '');
    return usfm
}

interface Element {
    type: string
    children: Array<any>
}

function serializeRecursive(value): string {
    if (Array.isArray(value)) {
        return value.map(serializeRecursive)
                    .reduce(concatUsfm)
    } else if (value.type && value.children) { // value implements the "Element" interface
        if (value.type === UsfmMarkers.CHAPTERS_AND_VERSES.v) {
            return serializeVerseNumber(value)
        } else if (isChapterHeaderOrVerse(value.type)) {
            // Structural types (header, chapter, verse) do not
            // have a tag that needs to be converted to usfm
            return serializeRecursive(value.children)
        } else {
            return serializeElement(value)
        }
    } else if (value.text) {
        return serializeTexts([value])
    } else {
        return ""
    }
}

function isChapterHeaderOrVerse(type: string) {
    return [
        NodeTypes.CHAPTER,
        NodeTypes.HEADERS,
        NodeTypes.VERSE
    ].includes(type)
}

function concatUsfm(a: string, b: string) {
    return a.concat(b)
}

function serializeVerseNumber(verseNumber: Element) {
    const verseNumberText = verseNumber.children[0].text
    // Front matter must start on the next line.
    // Whitespace will be normalized later, so empty front
    // matter will not cause multiple newlines.
    return verseNumberText === "front"
        ? "\n"
        : `\n\\v ${verseNumberText} `
}

function serializeElement(value: Element): string {
    const marker = serializeMarker(value.type)
    const space = marker.trim() ? " " : ""
    const content = serializeTexts(value.children)
    const endMarker = getEndMarker(value.type)
    return marker
        .concat(space)
        .concat(content)
        .concat(endMarker)
}

function serializeMarker(type: string): string {
    if (type === NodeTypes.INLINE_CONTAINER) {
        return ""
    }
    return `\n\\${type}`
}

function getEndMarker(type: string): string {
    const tagInfo = MarkerInfoMap.get(type)
    return tagInfo && tagInfo.endMarker
        ? `\\${tagInfo.endMarker}`
        : ""
}

/**
 * Processes marks to construct the corresponding usfm content 
 */
function serializeTexts(children: Array<Text>): string {
    let usfm = ""
    let markStack = new Array<string>()

    for (let i = 0; i < children.length; i++) {
        const text = children[i]
        const marks = MyText.marks(text)

        const removedMarks = setDiff([...markStack], marks)
        let result = closeMarks(usfm, markStack, removedMarks)
        usfm = result.usfm
        markStack = result.stack

        const addedMarks = setDiff(marks, [...markStack])

        const markerWithNoEndMarker = addedMarks
            .find(m => MarkerInfoMap.get(m).endMarker == null)
        // Sometimes an empty text and an adjacent text will have the same marker.
        // Forcing normalization would fix this, but for now we need to ensure that
        // the text field is non-empty.
        if (markerWithNoEndMarker && 
            text.text != ""
        ) {
            usfm += `\\${markerWithNoEndMarker} `
        }
        const closeableAddedMarks = addedMarks.filter(m => m != markerWithNoEndMarker)

        result = openMarks(usfm, markStack, closeableAddedMarks)
        usfm = result.usfm
        markStack = result.stack

        usfm += text.text
    }
    const res = closeMarks(usfm, markStack, [...markStack])
    return res.usfm
}

function setDiff<T>(a: T[], b: T[]) {
    const setA = new Set(a)
    const setB = new Set(b)
    return [...setA].filter(x => !setB.has(x))
}

interface Result {
    usfm: string,
    stack: Array<string>
}

/**
 * Adds closing tags for marks that should be closed (e.g. \nd or \nd+)
 */ 
function closeMarks(
    usfm: string,
    markStack: Array<string>, 
    toClose: Array<string>
): Result {

    while (toClose.length > 0) {
        const mark = toClose[0]
        let popped = ""
        while (popped != mark) {
            popped = markStack.pop()
            const endMarker = MarkerInfoMap.get(popped).endMarker
            // If there are still marks in the stack, 
            // this output tag should be nested, so add a "+"
            const plus = markStack.length > 0 
                ? "+"
                : ""
            usfm += `\\${plus}${endMarker}`
            toClose = toClose.filter(x => x != popped) // Remove from list
        }
    }
    return { usfm: usfm, stack: markStack }
}

/**
 * Adds opening tags for marks that should be opened (e.g. \nd or \+nd)
 */ 
function openMarks(
    usfm: string, 
    markStack: Array<string>, 
    toOpen: Array<string>
): Result {

    for (let i = 0; i < toOpen.length; i++) {
        const mark = toOpen[i]
        markStack.push(mark)
        // If there are additional marks in the stack, 
        // this output tag should be nested, so add a "+"
        const plus = markStack.length > 1
            ? "+"
            : ""
        usfm += `\\${plus}${mark} `
    }
    return { usfm: usfm, stack: markStack }
}