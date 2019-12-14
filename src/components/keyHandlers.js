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
    editor.deleteAtRange(editor.value.selection.toRange())
    editor.moveFocusToEndOfText()
    const text = editor.value.fragment.text
    const slateJson = usfmToSlateJson(
        "\\p" +
        (text.trim() ? " " : "") +
        text,
        false)
    editor.insertBlock(slateJson)

    // editor.helloWorld() // TODO: Remove
    editor.moveToStartOfText() // This puts the selection at the start of the new paragraph
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

        // The wrapper of the selected text
        const parent = value.document.getParent(anchor.path)
        // The previous sibling in the same verse, or null if there is none
        const prev = value.document.getPreviousSibling(parent.key)

        if (anchor.offset == 0) {
            if (!prev) {
                shouldPreventDefaultAction = true
            }
            else if (prev.type == "s") {
                // We can't just replace the parent node with a textWrapper since there
                // is no normalizer to combine adjacent "s" followed by textWrapper
                combineWrapperWithPreviousWrapper(editor, parent, prev)
                shouldPreventDefaultAction = true
            }
            else if (parent.type == "p" || parent.type == "s") {
                removeNewlineTagNode(editor, parent)
                shouldPreventDefaultAction = true
            }
            else if (isEmptyWrapper(parent)) {
                if (shouldRecurseBackwards(prev)) {
                    editor.moveToEndOfPreviousText()
                    editor.removeNodeByKey(parent.key)
                    return handleBackspace(editor)
                } else {
                    editor.removeNodeByKey(parent.key)
                    shouldPreventDefaultAction = true
                }
            }
            else {
                moveToEndOfPreviousText(editor, textNode)
                return handleBackspace(editor)
            }
        }
    }

    return shouldPreventDefaultAction
}

function isSelectionCollapsed(selection) {
    return selection.toRange().isCollapsed
}

function combineWrapperWithPreviousWrapper(editor, wrapper, prev) {
    const text = wrapper.getText()
    const offset = prev.getText().length
    editor.insertTextByKey(prev.nodes.get(0).key, offset, text)
    editor.removeNodeByKey(wrapper.key)
    editor.moveTo(prev.key, offset)
}

function shouldRecurseBackwards(prev) {
    // prev.getText() check ensures that we aren't trying to delete
    // an empty textWrapper at the start of a verse
    return prev && prev.getText()
}

function isEmptyWrapper(wrapper) {
    return !wrapper.getText()
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

function removeNewlineTagNode(editor, tagNode) {
    if (areAllDescendantTextsEmpty(tagNode)) {
        editor.removeNodeByKey(tagNode.key)
    } else {
        replaceTagWithTextWrapper(editor, tagNode)
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
function replaceTagWithTextWrapper(editor, tagNode) {
    const textNode = tagNode.nodes.get(0)
    const textWrapper = usfmToSlateJson(textNode.text)
    editor.replaceNodeByKey(tagNode.key, textWrapper)
}