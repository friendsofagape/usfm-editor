import * as usfmjs from "usfm-js";
import { objectToArrayRules, nextCharRules } from "../transforms/usfmjsStructureRules";
import { transform } from "json-transforms";
import { jsx } from "slate-hyperscript";
import NodeTypes from "../utils/NodeTypes";
import { emptyInlineContainer, verseNumber, verseWithChildren } from "./basicSlateNodeFactory";
import { UsfmMarkers }from "../utils/UsfmMarkers";

export function usfmToSlate(usfm) {
    const usfmJsDoc = usfmjs.toJSON(usfm);
    console.log("parsed from usfm-js", usfmJsDoc)

    const usfmAsArrays = transform(usfmJsDoc, objectToArrayRules);
    const processedAsArrays = transform(usfmAsArrays, nextCharRules);
    console.log("processedAsArrays", processedAsArrays)

    const slateTree = transformToSlate(processedAsArrays)
    console.log("slateTree", slateTree)

    return slateTree
}

export function transformToSlate(el) {
    if (el.hasOwnProperty("chapters")) {
        return fragment(el)
    } else if (el.hasOwnProperty("chapterNumber")) {
        return chapter(el)
    } else if (el.hasOwnProperty("verseNumber")) {
        return verse(el)
    } else if (el.hasOwnProperty("tag")) {
        if (UsfmMarkers.isParagraphType(el.tag)) {
            return paragraphElement(el)
        } else { // Character or Note marker
            return getDescendantTextNodes(el)
        }
    } else if (el.hasOwnProperty("text")) {
        return { text: processText(el.text) }
    } else {
        console.warn("Unrecognized node: ", el)
    }
}

function fragment(book) {
    const books = book.chapters.map(transformToSlate)
    const headers = jsx(
        'element',
        { type: NodeTypes.HEADERS },
        book.headers.map(transformToSlate)
    )
    const children = [headers, books].flat()
    return jsx('fragment', {}, children)
}

function chapterNumber(number) {
    return jsx('element',
        { type: UsfmMarkers.CHAPTERS_AND_VERSES.c },
        [number]
    )
}

function chapter(chapter) {
    const children = [chapterNumber(chapter.chapterNumber)]
        .concat(chapter.verses.map(transformToSlate))
    return jsx('element',
        { type: NodeTypes.CHAPTER },
        children
    )
}

function verse(verse) {
    let verseChildren = [verseNumber(verse.verseNumber)]
    let currentContainer = emptyInlineContainer()
    verseChildren = verseChildren.concat(currentContainer)

    for (let i = 0; i < verse.nodes.length; i++) {
        const node = verse.nodes[i]
        if (node.tag && UsfmMarkers.isParagraphType(node.tag)) {
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

function paragraphElement(tagNode) {
    const textNodes = getDescendantTextNodes(tagNode)

    return jsx('element',
        { type: tagNode.tag },
        textNodes
    )
}

function removeFirstEmptyText(node) {
    if (node.children.length > 1 &&
        node.children[0].text == ""
    ) {
        node.children = node.children.slice(1)
    }
    return node
}

/**
 * Returns a flat list of descendant text nodes and sets the appopriate marks 
 * on the text nodes
 */
function getDescendantTextNodes(tagNode) {
    let textNodes = [{ text: "" }]
    if (tagNode.hasOwnProperty("text") || tagNode.hasOwnProperty("content")) {
        textNodes = textNodes.concat({
            text: processText(tagNode.text ? tagNode.text : tagNode.content)
        })
    }
    if (tagNode.hasOwnProperty("attrib")) {
        textNodes = textNodes.concat({
            text: processText(tagNode.attrib)
        })
    }
    // \w marker will not have an 'attrib' field when parsed by usfm-js.
    if (tagNode.tag == UsfmMarkers.SPECIAL_FEATURES.w) {
        textNodes = textNodes.concat({
            text: processText(get_w_AttributeText(tagNode))
        })
    }
    if (tagNode.hasOwnProperty("children")) {
        // The children will either be additional tag nodes or simple texts, which
        // will all reduce to a list of text nodes
        textNodes = textNodes.concat(
            tagNode.children.map(transformToSlate)
        )
    }

    textNodes = textNodes.flat()

    // If this node is not a paragraph type (thus it is a character, note, or milestone type), 
    // we will apply the marker as a mark to every descendant text node.
    if (!UsfmMarkers.isParagraphType(tagNode.tag)) {
        textNodes.forEach(text => {
            const { markerWithoutLeadingPlus } = UsfmMarkers.destructureMarker(tagNode.tag)
            text[markerWithoutLeadingPlus] = true
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
function get_w_AttributeText(tagNode) {
    let text = ""
    const attributes = ['lemma', 'strong', 'srcloc']
    attributes.forEach(value => {
        if (tagNode.hasOwnProperty(value)) {
            text = text === ""
                ? "|"
                : text + " "
            text += `${value}=\"${tagNode[value]}\"`
        }
    })
    return text
}

function processText(text) {
    return text
        // Slate does not accept the pipe character so we have a workaround for this
        .replace(/\|/g, "&pipe;")
        // Remove newlines
        .replace(/[\r|\n|\r\n]/g, '')
}