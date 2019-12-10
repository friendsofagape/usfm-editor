import {usfmToSlateJson} from "./jsonTransforms/usfmToSlate";
import {getPreviousInlineNode, getAncestor, getHighestNonVerseInlineAncestor, getPreviousNodeMatchingPredicate, getHighestNonVerseBlockAncestor} from "../utils/documentUtils";

export function handleKeyPress(event, editor, next) {
    let shouldPreventDefault = false

    // correctSelection(editor)

    if (event.key == "Enter") {
        shouldPreventDefault = true
        handleEnter(editor)
    } else if (event.key == "Backspace") {
        shouldPreventDefault = handleBackspace(editor)
    }

    if (shouldPreventDefault) {
        event.preventDefault()
    } else {
        return next()
    }
}

export const InsertParagraphPlugin = {
    commands: {
        /**
         * @param {Editor} editor 
         */
        helloWorld(editor) {
            // const node = editor.value.document.getNode(editor.value.selection.anchor.path)
            // const prev = editor.value.document.getPreviousText(node.key)
            editor.moveToStartOfPreviousText()
            console.log("Hello World!")
            // const text = getPreviousNodeMatchingPredicate(editor.value.document, )
        }
    }
}

export function correctSelection(editor) {
    const {value} = editor
    if (isSelectionCollapsed(value.selection)) {
        const {anchor} = value.selection
        const textNode = value.document.getNode(anchor.path)

        if (!textNode.has("text")) {
            console.warn("Selection is not a text node")
        }
        // If empty text, move to end of previous text (and keep going)
        const parent = getAncestor(1, textNode, value.document)
        if (parent.type != "textWrapper" &&
            parent.type != "contentWrapper" &&
            parent.type != "verseNumber") {

            if (textNode.text.trim()) {
                console.warn("Nonempty text node does not have a wrapper inline")
            }

            moveToEndOfPreviousText(editor, textNode)
            return correctSelection(editor)
        }
    }
}

function handleEnter(editor) {
    if (isAnchorWithinSectionHeader(editor)) {
        console.debug("Cannot insert paragraph within a section header")
    } else {
        insertParagraph(editor)
    }
}

function isAnchorWithinSectionHeader(editor) {
    const {value} = editor
    const {anchor} = value.selection
    const textNode = value.document.getNode(anchor.path)
    const inline = getHighestNonVerseInlineAncestor(value.document, textNode)
    return inline && inline.type == "s"
}

function insertParagraph(editor) {
    const {selection} = editor.value 
    const document = editor.value.document

    const node = document.getNode(selection.anchor.path)
    const blockAncestor = getHighestNonVerseBlockAncestor(document, node)
    const depthDifference = document.getDepth(node.key) - document.getDepth(blockAncestor.key)

    if (blockAncestor.type == "p" && depthDifference == 2) {
        editor.splitBlock(2)
    } else {
        // if(isSelectionExpanded(selection)) {
        //     editor.deleteAtRange(selection.toRange())
        // }
        editor.moveFocusToEndOfText()
        const slateJson = usfmToSlateJson("\\p " + editor.value.fragment.text, false)
        // // editor.insertInline(slateJson)
        editor.insertBlock(slateJson)
    }

    // editor.helloWorld() // TODO: Remove
    editor.moveToStartOfNextText() // This puts the selection at the start of the new paragraph
}

function handleBackspace(editor) {
    const {value} = editor
    let shouldPreventDefaultAction = false

    if (isSelectionCollapsed(value.selection)) {
        const {anchor} = value.selection
        const textNode = value.document.getNode(anchor.path)
        if (!textNode.has("text")) {
            console.warn("Selection is not a text node")
        }

        // We can't just get the direct parent of the text, since it might be a
        // contentWrapper that is still contained by an "s" inline, or something
        // else. However, the text node might just be a plain old empty text
        // with no wrapper, so we need to handle the null case (i.e., inline can
        // be null)
        const inline = getHighestNonVerseInlineAncestor(value.document, textNode)

        if (inline && inline.type == "id") {
            shouldPreventDefaultAction = true
        }
        else if (isAnchorAtStartOfParagraph(inline, textNode, anchor)) {
            removeParagraph(editor, inline)
            shouldPreventDefaultAction = true
        }
        else if (isEmptyTextSectionHeader(inline)) {
            removeSectionHeader(editor, inline)
            shouldPreventDefaultAction = true
        }
        else if (isEmptyTextInline(inline)) {
            const {document} = editor.value
            const prevInline = getPreviousInlineNode(document, inline)
            if (prevInline) {
                moveToEndOfPreviousInlineText(editor, inline)
                removeEmptyTextInline(editor, inline)
                return handleBackspace(editor)
            } else {
                shouldPreventDefaultAction = true
            }
        }
        // } else if (anchor.offset == 0) {
        //     moveToEndOfPreviousText(editor, textNode)
        //     return handleBackspace(editor)
        // }
    }

    return shouldPreventDefaultAction
}

function isSelectionCollapsed(selection) {
    return selection.toRange().isCollapsed
}

function isSelectionExpanded(selection) {
    return !isSelectionCollapsed(selection)
}

function isAnchorAtStartOfParagraph(inline, selectedTextNode, anchor) {
    if (inline &&
        inline.type == "p" &&
        anchor.offset == 0) {
        return ! isThereANonEmptyTextBeforeSelectedTextNode(inline, selectedTextNode)
    } else {
        return false
    }
}

function isEmptyTextSectionHeader(inline) {
    return inline && inline.type == "s" && areAllDescendantTextsEmpty(inline) 
}

function isEmptyTextInline(inline) {
    return inline && areAllDescendantTextsEmpty(inline)
}


function removeEmptyTextInline(editor, inline) {
    editor.removeNodeByKey(inline.key)
}

function moveToEndOfPreviousText(editor, textNode) {
    const prevText = editor.value.document.getPreviousText(textNode.key)
    if (prevText) {
        editor.moveToEndOfNode(prevText)
    }
}

function moveToEndOfPreviousInlineText(editor, inline) {
    const {document} = editor.value
    const prevInline = getPreviousInlineNode(document, inline)
    if (prevInline) {
        editor.moveToEndOfNode(findDeepestChildTextNode(document, prevInline))
    }
}

function removeSectionHeader(editor, inline) {
    editor.removeNodeByKey(inline.key)
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

function isThereANonEmptyTextBeforeSelectedTextNode(inline, selectedTextNode) {
    const texts = inline.getTexts()
    const idxOfNonEmptyText = texts.findIndex(t => t.text.trim())
    if (idxOfNonEmptyText == -1) {
        return false
    }
    const idxOfSelected = texts.indexOf(selectedTextNode)
    return idxOfNonEmptyText < idxOfSelected
}

function areAllDescendantTextsEmpty(inline) {
    return !inline.text.trim()
}

/**
 * Precondition: text.trim() is not empty 
 */
function replaceParagraphWithTextWrapper(editor, inlineParagraph) {
    const textNode = findDeepestChildTextNode(editor.value.document, inlineParagraph)
    const textWrapper = usfmToSlateJson(textNode.text)
    editor.replaceNodeByKey(inlineParagraph.key, textWrapper)
}