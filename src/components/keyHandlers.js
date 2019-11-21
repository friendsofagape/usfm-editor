import {usfmToSlateJson} from "./jsonTransforms/usfmToSlate";
import {getPreviousInlineSibling, getPreviousInlineNode} from "../utils/documentUtils";

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
    var shouldPreventDefaultAction = false

    if (isSelectionSinglePoint(value.selection)) {
        const {anchor} = value.selection
        const textNode = value.document.getNode(anchor.path)
        if (!textNode.has("text")) {
            console.error("Selection is not a text node")
        }

        // We can't just get the direct parent of the text, since it might be a contentWrapper that
        //    is still contained by an "s" inline, or something else.
        // However, the text node might just be a plain old empty text with no wrapper, so we need to handle the null case
        // (i.e., inline can be null)
        const inline = getFurthestNonVerseInline(value.document, textNode)

        if (inline && inline.type == "id") {
            shouldPreventDefaultAction = true
        }
        else if (isAnchorAtStartOfParagraph(inline, textNode, anchor)) {
            console.debug("Anchor is at start of paragraph")
            removeParagraph(editor, inline)
            shouldPreventDefaultAction = true
        }
        else if (isEmptyTextSectionHeader(inline)) {
            console.debug("Empty text section header")
            removeSectionHeader(editor, inline)
            shouldPreventDefaultAction = true
        }
        else if (isEmptyTextInline(inline)) {
            console.debug("Empty text inline")
            moveToEndOfPreviousInlineText(editor, inline)
            removeEmptyTextInline(editor, inline)
            return handleBackspace(editor)
        }
        else if (anchor.offset == 0) {
            console.debug("Moving to end of previous text")
            moveToEndOfPreviousTextNode(editor, textNode)
            return handleBackspace(editor)
        }
    }

    return shouldPreventDefaultAction
}

function removeEmptyTextInline(editor, inline) {
    editor.removeNodeByKey(inline.key)
}

function moveToEndOfPreviousTextNode(editor, textNode) {
    const prevText = editor.value.document.getPreviousText(textNode.key)
    editor.moveToEndOfNode(prevText)
}

function moveToEndOfPreviousInlineText(editor, inline) {
    const {document} = editor.value
    const prevInline = getPreviousInlineNode(document, inline)
    editor.moveToEndOfNode(findDeepestChildTextNode(document, prevInline))
}

function removeSectionHeader(editor, inline) {
    editor.removeNodeByKey(inline.key)
}

function isEmptyTextSectionHeader(inline) {
    return inline && isSectionHeader(inline) && areAllDescendantTextsEmpty(inline) 
}

function isSectionHeader(inline) {
    return inline.type && inline.type == "s"
}

function removeParagraph(editor, inline) {
    if (areAllDescendantTextsEmpty(inline)) {
        editor.removeNodeByKey(inline.key)
    } else {
        replaceParagraphWithTextWrapper(editor, inline)
    }
}

function findDeepestChildTextNode(document, node) {
    return node
        .getTexts()
        .maxBy(n => document.getDepth(n.key))
}

function isEmptyTextInline(inline) {
    return inline && areAllDescendantTextsEmpty(inline)
}

function isAnchorAtStartOfParagraph(inline, selectedTextNode, anchor) {
    if (inline &&
        isParagraph(inline) &&
        anchor.offset == 0) {
        return ! isThereANonEmptyTextBeforeSelectedTextNode(inline, selectedTextNode)
    } else {
        return false
    }
}

function isThereANonEmptyTextBeforeSelectedTextNode(inline, selectedTextNode) {
    const texts = inline.getTexts()
    const idxOfNonEmptyText = texts.findIndex(t => t.text.trim())
    if (idxOfNonEmptyText == -1) {
        return false
    }
    const idxOfSelected = texts.indexOf(selectedTextNode)
    if (idxOfNonEmptyText < idxOfSelected) {
        return true
    } else {
        return false
    }
}

function areAllDescendantTextsEmpty(inline) {
    const texts = inline.getTexts()
    const nonEmptyText = texts.find(t => t.text.trim())
    return nonEmptyText ? false : true
}

function isParagraph(inline) {
    return inline.type && inline.type == "p"
}

function isSelectionSinglePoint(selection) {
    const {anchor, focus} = selection
    return anchor.path.equals(focus.path) && anchor.offset == focus.offset
}

function massageSelectionForRemovalOfInline(document, inline, editor) {
    // The following will always work if we guarantee that verses will start with a textWrapper.
    // If there is no previous sibling, we have deleted all text in that first textWrapper, but it should not be deleted.
    const prevSibling = getPreviousInlineSibling(document, inline)
    if (prevSibling) {
        if (prevSibling.object != "text") {
            const text = findDeepestChildTextNode(document, prevSibling)
            editor.moveAnchorToEndOfNode(text)
        } else {
            editor.moveAnchorToEndOfNode(prevSibling)
        }
        const nextSibling = document.getNextSibling(inline.key) // in many (or all) cases, next sibling is actually an empty ("") text node
        editor.moveFocusToStartOfNode(nextSibling)
    }
}

/**
 * Precondition: text.trim() is not empty 
 */
function replaceParagraphWithTextWrapper(editor, inlineParagraph) {
    const textNode = findDeepestChildTextNode(editor.value.document, inlineParagraph)
    const textWrapper = usfmToSlateJson(textNode.text)
    editor.replaceNodeByKey(inlineParagraph.key, textWrapper)
}

function getFurthestNonVerseInline(document, node) {
    return document.getFurthest(node.key, n => n.object == "inline" && n.type != "verseBody" && n.type != "verse")
}