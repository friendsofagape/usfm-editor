import {usfmToSlateJson} from "./jsonTransforms/usfmToSlate";
import {getPreviousInlineSibling, getPreviousInlineNode} from "../utils/documentUtils";
import {nodeHasSourceText, getSource, getSourceTextField} from "../utils/nodeUtils";

export function handleKeyPress(event, editor, next) {
    var shouldPreventDefault = false

    if (event.key == "Enter") {
        shouldPreventDefault = true
        insertParagraph(editor)
    } else if (event.key == "Backspace") {
        shouldPreventDefault = handleBackspace(editor)
    }

    if (shouldPreventDefault) {
        event.preventDefault()
    } else {
        return next()
    }
}

function insertParagraph(editor) {
    const slateJson = usfmToSlateJson("\\p", false)
    editor.insertInline(slateJson)
}

function handleBackspace(editor) {
    const {value} = editor

    if (isSelectionSinglePoint(value.selection)) {
        const textNode = getSelectedTextNode(value)
        const {anchor} = value.selection
        // We can't just get the direct parent of the text, since it might be a contentWrapper that is still contained by an "s" inline, or other
        // However, this might just be a plain old empty text with no wrapper, so need to handle the null case
        const inline = getFurthestNonVerseInline(value.document, textNode)
        const prevInline = getPreviousInlineNode(value.document, inline ? inline : textNode)

        var shouldPreventDefaultAction = false

        if (isEmptyTextInline(inline, textNode)) {
            massageSelectionForRemovalOfInline(value.document, inline, editor)
        }
        else if (isAnchorAtStartOfParagraph(inline, anchor)) {
            replaceParagraphWithTextWrapper(editor, inline, textNode.text)
            shouldPreventDefaultAction = true
        }
        else if (anchor.offset == 0) {
            editor.moveToEndOfNode(findDeepestChildTextNode(value.document, prevInline))
            return handleBackspace(editor)
        }
    }

    return shouldPreventDefaultAction
}

function findDeepestChildTextNode(document, node) {
    return node
        .filterDescendants(n => n.object == "text")
        .maxBy(n => document.getDepth(n.key))
}

function isEmptyTextInline(inline) {
    return inline && isChildTextEmpty(inline)
}

function isEmptyText(hasText) {
    return !hasText.text.trim()
}

function isAnchorAtStartOfParagraph(inline, anchor) {
    return inline && anchor.offset == 0 && isParagraph(inline)
}

function isChildTextEmpty(inline) {
    const wrapper = nodeHasSourceText(inline) ? inline :
        inline.nodes.find(n => nodeHasSourceText(n))
    if (wrapper) {
        const text = getSourceText(wrapper)
        return !text.trim()
    } else {
        return true
    }
}

function isParagraph(node) {
    return node.type == "p"
}

function getSelectedTextNode(value) {
    const range = value.selection.toRange()
    const texts = value.document.getTextsAtRange(range)
    const textNode = texts.get(0)
    return textNode
}

function isSelectionSinglePoint(selection) {
    const {anchor, focus} = selection
    return anchor.path.equals(focus.path)
}

function massageSelectionForRemovalOfInline(document, inline, editor) {
    // The following will always work if we guarantee that verses will start with a textWrapper.
    // If there is no previous sibling, we have deleted all text in that first textWrapper, but it should not be deleted.
    const prevSibling = getPreviousInlineSibling(document, inline)
    if (prevSibling) {
        editor.moveAnchorToEndOfNode(prevSibling)
        const nextSibling = document.getNextSibling(inline.key) // in many (or all) cases, next sibling is actually an empty ("") text node
        editor.moveFocusToStartOfNode(nextSibling)
    }
}

/**
 * Precondition: text.trim() is not empty 
 */
function replaceParagraphWithTextWrapper(editor, inlineParagraph, text) {
    const textWrapper = usfmToSlateJson(text)
    editor.replaceNodeByKey(inlineParagraph.key, textWrapper)
}

function getFurthestNonVerseInline(document, node) {
    return document.getFurthest(node.key, n => n.object == "inline" && n.type != "verseBody" && n.type != "verse")
}

function getSourceText(node) {
    const source = getSource(node)
    const field = getSourceTextField(node)
    return (source && field) ? source[field] : undefined
}
