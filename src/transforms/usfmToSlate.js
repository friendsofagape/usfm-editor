import * as usfmjs from "usfm-js";
import { objectToArrayRules } from "../transforms/usfmjsStructureRules";
import { transform } from "json-transforms";
import { jsx } from "slate-hyperscript";
import { NodeTypes } from "../utils/NodeTypes";

export function usfmToSlate(usfm) {
    const usfmJsDoc = usfmjs.toJSON(usfm);
    console.log("parsed from usfm-js", usfmJsDoc)

    const usfmAsArrays = transform(usfmJsDoc, objectToArrayRules);
    console.log("usfmAsArrays", usfmAsArrays)

    const slateTree = transformToSlate(usfmAsArrays)
    console.log("slateTree", slateTree)

    return slateTree
}

function transformToSlate(el) {
    if (el.hasOwnProperty("chapters")) {
        return fragment(el)
    } else if (el.hasOwnProperty("chapterNumber")) {
        return chapter(el)
    } else if (el.hasOwnProperty("verseNumber")) {
        return verse(el)
    } else if (el.hasOwnProperty("tag")) {
        if (NodeTypes.isNewlineNodeType(el.tag)) {
            return newlineContainer(el)
        } else {
            return getDescendantTextNodes(el)
        }
    } else if (el.hasOwnProperty("text")) {
        return { text: removeTrailingNewlines(el.text) }
    } else {
        console.warn("Unrecognized node")
    }
}

function fragment(book) {
    const headers = jsx(
        'element',
        { type: 'headers'},
        book.headers.map(transformToSlate)
    )
    const books = book.chapters.map(transformToSlate) 
    const children = [headers, books].flat()
    return jsx('fragment', {}, children)
}

function chapterNumber(number) {
    return jsx('element',
        {type: 'chapterNumber'},
        [ number ]
    )
}

function verseNumber(number) {
    return jsx('element',
        {type: 'verseNumber'},
        [ number ]
    )
}

function chapter(chapter) {
    const children = [chapterNumber(chapter.chapterNumber)]
        .concat(chapter.verses.map(transformToSlate))
    return jsx('element', 
        { type: 'chapter'},
        children
    )
}

function emptyInlineContainer() {
    return jsx('element',
        { type: 'inlineContainer'},
        [""])
}

function verse(verse) {
    let verseChildren = [verseNumber(verse.verseNumber)]
    let currentContainer = emptyInlineContainer()
    verseChildren = verseChildren.concat(currentContainer)

    for (let i = 0; i < verse.nodes.length; i++) {
        const node = verse.nodes[i]
        if (node.tag && NodeTypes.isNewlineNodeType(node.tag)) {
            currentContainer = newlineContainer(node)
            verseChildren = verseChildren.concat(currentContainer)
        } else {
            currentContainer.children = currentContainer.children.concat(
                transformToSlate(node)
            )
        }
    }
    return jsx('element', 
        { type: 'verse'}, 
        verseChildren
    )
}

function newlineContainer(tagNode) {
    const textNodes = getDescendantTextNodes(tagNode)

    return jsx('element', 
        {type: tagNode.tag}, 
        textNodes
    )
}

/**
 * Returns a flat list of descendant text nodes and sets the formatting properties
 * on the text nodes
 */
function getDescendantTextNodes(tagNode) {
    let textNodes = [{text: ""}] 
    if (tagNode.hasOwnProperty("text") || tagNode.hasOwnProperty("content")) {
        textNodes = textNodes.concat({
            text: removeTrailingNewlines(tagNode.text ? tagNode.text : tagNode.content)
        })
    }
    if (tagNode.hasOwnProperty("children")) {
        // The children will either be additional formatting tag nodes or simple texts, which
        // will all reduce to a list of text nodes
        textNodes = textNodes.concat(
            tagNode.children.map(transformToSlate)
        )
    }
    textNodes = textNodes.flat()
    if (NodeTypes.isInlineFormattingNodeType(tagNode.tag)) {
        textNodes.forEach(text => {
            text[tagNode.tag] = true
        })
    }
    return textNodes
}

function removeTrailingNewlines(text) {
    return text.replace(/[\r|\n|\r\n]$/, '')
}