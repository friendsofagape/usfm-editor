import { NodeTypes } from "../utils/NodeTypes"
import { MyText } from "../plugins/helpers/MyText"
import { Text } from "slate"

export function slateToUsfm(value): string {
    const usfm = serializeRecursive(value)
    return normalizeWhitespace(usfm)
}

function normalizeWhitespace(usfm: string): string {
    // Remove leading newline
    usfm = usfm.replace(/^\n/, '');
    // Multiple adjacent newlines normalized to one
    usfm = usfm.replace(/\n\s*\n/g, '\n');
    return usfm
}

function serializeRecursive(value): string {
    if (Array.isArray(value)) {
        return value.map(serializeRecursive)
                    .reduce(concatUsfm)
    } else if (value.type) {
        if (value.type === NodeTypes.VERSE_NUMBER) {
            return serializeVerseNumber(value)
        } else if (NodeTypes.isStructuralType(value.type)) {
            // Structural types (header, chapter, verse) do not
            // have a tag that needs to be converted to usfm
            return serializeRecursive(value.children)
        } else {
            return serializeElement(value)
        }
    } else if (value.text) {
        return serializeMarks([value])
    } else {
        return ""
    }
}

function concatUsfm(a: string, b: string) {
    return a.concat(b)
}

interface Element {
    type: string
    children: Array<any>
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
    const tag = serializeTag(value)
    const content = serializeMarks(value.children)
    return tag.concat(content)
}

function serializeTag(value: Element): string {
    const { type } = value
    return ((type) => {
        if (type == NodeTypes.CHAPTER_NUMBER) {
            return "\n\\c "
        } else if (NodeTypes.isParagraphMarker(type)) {
            return `\n\\${type} `
        } else {
            // inlineContainers do not have an associated tag.
            return ""
        }
    })(type)
}

/**
 * Processes marks to construct the corresponding usfm content 
 */
function serializeMarks(children: Array<Text>): string {
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
        result = openMarks(usfm, markStack, addedMarks)
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
            // If there are still marks in the stack, 
            // this output tag should be nested, so add a "+"
            const plus = markStack.length > 0 
                ? "+"
                : ""
            usfm += `\\${plus}${popped}*`
            toClose = toClose.filter(x => x != popped) // Remove from list
        }
    }
    return { usfm: usfm, stack: markStack }
}

/**
 * Adds opening tags for marks that should be opened (e.g. \nd* or \+nd*)
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