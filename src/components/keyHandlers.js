import {usfmToSlateJson} from "./jsonTransforms/usfmToSlate";
import {getHighestNonVerseInlineAncestor} from "../utils/documentUtils";

export function handleKeyPress(event, editor, next) {
    let shouldPreventDefault = false

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

        const wrapper = value.document.getParent(anchor.path)
        // The previous sibling in the same verse, or null if there is none
        const prev = value.document.getPreviousSibling(wrapper.key)

        if (anchor.offset == 0) {
            if (!prev) {
                shouldPreventDefaultAction = true
            }
            else if (prev.type == "s") {
                // We can't just replace the wrapper node with a textWrapper since there
                // is no normalizer to combine adjacent "s" followed by textWrapper
                combineWrapperWithPreviousWrapper(editor, wrapper, prev)
                shouldPreventDefaultAction = true
            }
            else if (wrapper.type == "p" || wrapper.type == "s") {
                removeNewlineTagNode(editor, wrapper)
                shouldPreventDefaultAction = true
            }
            else if (isEmptyWrapper(wrapper)) {
                if (shouldRecurseBackwards(prev)) {
                    editor.moveToEndOfPreviousText()
                    editor.removeNodeByKey(wrapper.key)
                    return handleBackspace(editor)
                } else {
                    editor.removeNodeByKey(wrapper.key)
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

function moveToEndOfPreviousText(editor, textNode) {
    const prevText = editor.value.document.getPreviousText(textNode.key)
    if (prevText) {
        editor.moveToEndOfNode(prevText)
    }
}

function removeNewlineTagNode(editor, tagNode) {
    if (areAllDescendantTextsEmpty(tagNode)) {
        editor.removeNodeByKey(tagNode.key)
    } else {
        replaceTagWithTextWrapper(editor, tagNode)
    }
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