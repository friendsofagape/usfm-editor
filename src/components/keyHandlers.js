import {createSlateNodeByType, nodeTypes} from "./jsonTransforms/usfmToSlate";
import { getAncestorFromPath } from "../utils/documentUtils";

export function handleKeyPress(event, editor, next) {
    let shouldPreventDefault = false

    if (event.key == "Enter") {
        shouldPreventDefault = true
        handleEnter(editor)
    } else if (event.key == "Backspace") {
        shouldPreventDefault = handleBackspace(editor)
    } else if (event.key == "Delete") {
        shouldPreventDefault = handleDelete(editor)
    }
    if (shouldPreventDefault) {
        event.preventDefault()
    } else {
        return next()
    }
}

function handleDelete(editor) {
    const {value} = editor
    let shouldPreventDefaultAction = false

    if (isSelectionCollapsed(value.selection)) {
        const {anchor} = value.selection
        const textNode = value.document.getNode(anchor.path)
        if (!textNode.has("text")) {
            console.warn("Selection is not a text node")
        }

        const wrapper = value.document.getParent(anchor.path)
        // The next sibling in the same verse, or null if there is none
        const next = value.document.getNextSibling(wrapper.key)

        if (!next) {
            shouldPreventDefaultAction = true
        }
        else if (isEmptyWrapper(wrapper) && 
            wrapper.type != "textWrapper" && 
            wrapper.type != "p"
        ) {
            editor.removeNodeByKey(wrapper.key)
            shouldPreventDefaultAction = true
        }
        else if (anchor.offset == textNode.text.length && 
            next && next.type != "s" && next.type != "p") {
            // At the end of a non-newline the text node
            // let delete delete the first character of the next wrapper
            editor.moveToStartOfNextText()
            shouldPreventDefaultAction = false 
        } 
    }

    return shouldPreventDefaultAction
}

function isFocusAtEndOfNode(value) {
    const textNodeAtFocus = value.document.getNode(value.selection.focus.path)
    return value.selection.focus.isAtEndOfNode(textNodeAtFocus)
}

function isWrapperInline(wrapper) {
    return wrapper.type != nodeTypes.P && wrapper.type != nodeTypes.S
}

function insertEmptyParagraph(editor) {
    const paragraph = createSlateNodeByType(nodeTypes.P, "")
    editor.insertBlock(paragraph)
    editor.moveToStartOfText()
}

function changeWrapperToParagraph(editor, wrapper) {
    changeWrapperType(editor, wrapper, nodeTypes.P)
    editor.moveToStartOfNextText()
}

function handleEnter(editor) {
    editor.deleteAtRange(editor.value.selection.toRange())
    // If we want ENTER to work as expected if the selection was expanded,
    // Everything after this point needs to happen in a subsequent set of operations.
    // This is because an invalid merge operation will cancel all subsequent operations.

    if (isFocusAtEndOfNode(editor.value)) {
        insertEmptyParagraph(editor)
    } else {
        editor.splitBlock()
        const resultOfSplit = getAncestorFromPath(1, 
            editor.value.selection.focus.path, 
            editor.value.document)
        if (isWrapperInline(resultOfSplit)) {
            insertEmptyParagraph(editor)
        }
        else if (resultOfSplit.type == nodeTypes.S) {
            changeWrapperToParagraph(editor, resultOfSplit)
        }
    }
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
            if (prev.type == "s") {
                // We can't just replace the wrapper node with a textWrapper since there
                // is no normalizer to combine adjacent "s" followed by textWrapper
                editor.mergeNodeByKey(wrapper.key)
                shouldPreventDefaultAction = true
            }
            else if (wrapper.type == "p" || wrapper.type == "s") {
                removeNewlineTagNode(editor, wrapper)
                shouldPreventDefaultAction = true
            }
            else if (isEmptyWrapper(wrapper) && wrapper.type != "textWrapper") {
                editor.removeNodeByKey(wrapper.key)
                shouldPreventDefaultAction = true
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

function isEmptyWrapper(wrapper) {
    return !wrapper.getText()
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
        changeWrapperType(editor, tagNode, nodeTypes.TEXTWRAPPER)
    }
}

function areAllDescendantTextsEmpty(node) {
    return !node.text.trim()
}

/**
 * Precondition: text content is not empty 
 */
export function changeWrapperType(editor, wrapper, newNodeType) {
    const textNode = wrapper.nodes.get(0)
    const newWrapper = createSlateNodeByType(newNodeType, textNode.text)
    editor.replaceNodeByKey(wrapper.key, newWrapper)
}