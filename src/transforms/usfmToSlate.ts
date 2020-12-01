import * as usfmjs from "usfm-js"
import { objectToArrayRules, nextCharRules } from "./usfmjsStructureRules"
import { transform } from "json-transforms"
import { jsx } from "slate-hyperscript"
import NodeTypes from "../utils/NodeTypes"
import {
    emptyInlineContainer,
    verseNumber,
    verseWithChildren,
} from "./basicSlateNodeFactory"
import { UsfmMarkers } from "../utils/UsfmMarkers"
import { Element, Node } from "slate"

type TransformElement = Record<string, unknown> & {
    text?: string
    content?: string
}
type Book = {
    chapters: Chapter[]
    headers: TransformElement[]
}
type Chapter = {
    chapterNumber: string
    verses: Verse[]
}
type Verse = {
    verseNumber: string
    nodes: TransformElement[]
}
type Tag = TransformElement & {
    tag: string
}
type HasText = TransformElement & {
    text: string
}
type HasContent = TransformElement & {
    content: string
}
type HasAttrib = TransformElement & {
    attrib: string
}
type HasChildren = TransformElement & {
    children: TransformElement[]
}

function isBook(e: TransformElement): e is Book {
    return (
        Array.isArray(e.chapters) &&
        Array.isArray(e.headers) &&
        e.chapters.every(isChapter)
    )
}
function isChapter(e: TransformElement): e is Chapter {
    return typeof e.chapterNumber === "string" && Array.isArray(e.verses)
}
function isVerse(e: TransformElement): e is Verse {
    return typeof e.verseNumber === "string" && Array.isArray(e.nodes)
}
function isTag(e: TransformElement): e is Tag {
    return typeof e.tag === "string"
}
function isHasText(e: TransformElement): e is HasText {
    return typeof e.text === "string"
}
function isHasContent(e: TransformElement): e is HasContent {
    return typeof e.content === "string"
}
function isHasAttrib(e: TransformElement): e is HasAttrib {
    return typeof e.attrib === "string"
}
function isHasChildren(e: TransformElement): e is HasChildren {
    return Array.isArray(e.children)
}

export function usfmToSlate(usfm: string): Node[] {
    const usfmJsDoc = usfmjs.toJSON(usfm)
    console.log("parsed from usfm-js", usfmJsDoc)

    const usfmAsArrays = transform(usfmJsDoc, objectToArrayRules)
    const processedAsArrays = transform(usfmAsArrays, nextCharRules)
    console.log("processedAsArrays", processedAsArrays)

    const slateTree = transformToSlate(processedAsArrays)
    console.log("slateTree", slateTree)

    return Array.isArray(slateTree) ? slateTree : [slateTree]
}

export function transformToSlate(el: TransformElement): Node | Node[] {
    if (isBook(el)) {
        return book(el)
    } else if (isChapter(el)) {
        return [chapter(el)]
    } else if (isVerse(el)) {
        return [verse(el)]
    } else if (isTag(el)) {
        if (typeof el.tag === "string" && UsfmMarkers.isParagraphType(el.tag)) {
            return paragraphElement(el)
        } else {
            // Character or Note marker
            return getDescendantTextNodes(el)
        }
    } else if (isHasText(el)) {
        return processText(String(el.text))
    } else {
        console.warn("Unrecognized node: ", el)
        return []
    }
}

function book(book: Book) {
    const books = book.chapters.map(chapter)
    const headers = jsx(
        "element",
        { type: NodeTypes.HEADERS },
        book.headers.map(transformToSlate)
    )
    const children = [headers, books].flat()
    return jsx("fragment", {}, children)
}

function chapterNumber(number: string) {
    return jsx("element", { type: UsfmMarkers.CHAPTERS_AND_VERSES.c }, [number])
}

function chapter(chapter: Chapter) {
    const number: Node[] = [chapterNumber(chapter.chapterNumber)]
    const verses: Node[] = chapter.verses.map(verse)
    const children: Node[] = number.concat(verses)
    return jsx("element", { type: NodeTypes.CHAPTER }, children)
}

function verse(verse: Verse) {
    let verseChildren = [verseNumber(verse.verseNumber)]
    let currentContainer = emptyInlineContainer()
    verseChildren = verseChildren.concat(currentContainer)

    for (const node of verse.nodes) {
        if (isTag(node) && UsfmMarkers.isParagraphType(node.tag)) {
            currentContainer = paragraphElement(node)
            verseChildren = verseChildren.concat(currentContainer)
        } else {
            currentContainer.children = currentContainer.children.concat(
                transformToSlate(node)
            )
        }
        currentContainer = removeFirstEmptyText(currentContainer)
    }
    return verseWithChildren(verseChildren)
}

function paragraphElement(tagNode: Tag) {
    return textElement(tagNode)
}

function textElement(tagNode: Tag) {
    const textNodes = getDescendantTextNodes(tagNode)
    return jsx("element", { type: tagNode.tag }, textNodes)
}

function removeFirstEmptyText(node: Element) {
    if (node.children.length > 1 && node.children[0].text == "") {
        node.children = node.children.slice(1)
    }
    return node
}

/**
 * Returns a flat list of descendant text nodes and sets the appopriate marks
 * on the text nodes
 */
function getDescendantTextNodes(tagNode: TransformElement): HasText[] {
    let textNodes: HasText[] = [{ text: "" }]
    if (isHasText(tagNode)) {
        textNodes = textNodes.concat(processText(tagNode.text))
    } else if (isHasContent(tagNode)) {
        textNodes = textNodes.concat(processText(tagNode.content))
    }

    if (isHasAttrib(tagNode)) {
        textNodes = textNodes.concat(processText(tagNode.attrib))
    }

    // \w marker will not have an 'attrib' field when parsed by usfm-js.
    if (isTag(tagNode) && tagNode.tag == UsfmMarkers.SPECIAL_FEATURES.w) {
        textNodes = textNodes.concat(processText(get_w_AttributeText(tagNode)))
    }

    if (isHasChildren(tagNode)) {
        // The children will either be additional tag nodes or simple texts, which
        // will all reduce to a list of text nodes
        const childText = tagNode.children.map(getDescendantTextNodes)
        textNodes = textNodes.concat(...childText)
    }

    textNodes = textNodes.flat()

    // If this node is not a paragraph type (thus it is a character, note, or milestone type),
    // we will apply the marker as a mark to every descendant text node.
    if (isTag(tagNode) && !UsfmMarkers.isParagraphType(tagNode.tag)) {
        textNodes.forEach((text) => {
            const destructured = UsfmMarkers.destructureMarker(tagNode.tag)
            const bareMarker = destructured?.markerWithoutLeadingPlus
            if (bareMarker) text[bareMarker] = true
        })
    }

    return textNodes
}

/**
 * Usfm-js parses the \w marker differently than the other markers with attributes.
 * This function returns a string that starts with a pipe character and contains
 * the attributes for the \w marker. Unfortunately, the original order of the attributes
 * may not be preserved since usfm-js does not tell us what the original order was.
 */
function get_w_AttributeText(tagNode: Tag): string {
    let text = ""
    const attributes = ["lemma", "strong", "srcloc"]
    attributes.forEach((value) => {
        if (tagNode.hasOwnProperty(value)) {
            text = text === "" ? "|" : text + " "
            text += `${value}=\"${tagNode[value]}\"`
        }
    })
    return text
}

function processText(text: string): HasText {
    return {
        text: text
            // Slate does not accept the pipe character so we have a workaround for this
            .replace(/\|/g, "&pipe;")
            // Remove newlines
            .replace(/[\r|\n|\r\n]/g, ""),
    }
}
