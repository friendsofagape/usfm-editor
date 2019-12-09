import {Editor} from "slate-react";
import {usfmToSlateJson} from "./jsonTransforms/usfmToSlate";

export const SectionHeaderPlugin = {
    commands: {
        /**
         * @param {Editor} editor 
         */
        createSectionHeader(editor) {
            if (!validateSelection(editor)) {
                return
            }
            const usfm = "\\s " + editor.value.fragment.text
            // const slateJson = usfmToSlateJson(usfm, true)
            const slateJson = usfmToSlateJson(usfm, false)
            // editor.insertInline(slateJson) // causes remove_text, split_node, and insert_node to fire
            editor.insertBlock(slateJson) // causes remove_text, split_node, and insert_node to fire
        }
    }
}

function validateSelection(editor) {
    const {value} = editor

    if (selectedTextIsEmpty(value)) {
        console.log("Must select non-empty text to create a section header")
        return false
    }
    const nonEmptyTextNodes = getNonEmptySelectedTextNodes(value)

    if (nonEmptyTextNodes.size != 1) {
        console.log("Must select exactly one node with text to create a section header")
        return false
    } else {
        const selectedTextNode = nonEmptyTextNodes.get(0)
        if (!parentIsUnstyledTextWrapper(value, selectedTextNode)) {
            console.log("Invalid selection")
            return false
        }
        fixSelection(editor, selectedTextNode)
        return true
    }
}

function selectedTextIsEmpty(value) {
    return !value.fragment.text.trim()
}

function getNonEmptySelectedTextNodes(value) {
    const range = value.selection.toRange()
    const nodesInRange = value.document.getDescendantsAtRange(range)
    return nodesInRange.filter(n => n.object == "text" && n.text.trim())
}

function parentIsUnstyledTextWrapper(value, textNode) {
    const parent = value.document.getParent(textNode.key)
    if (parent.type != "textWrapper") {
        return false
    }
    const textWrapperParent = value.document.getParent(parent.key)
    const validParentTypes = ["verseBody", "chapterBody", "p"]
    return validParentTypes.includes(textWrapperParent.type)
}

function fixSelection(editor, textNode) {
    const {value} = editor
    const textNodePath = value.document.getPath(textNode)
    const anchorPath = value.selection.anchor.path
    const focusPath = value.selection.focus.path

    if (focusIsAfterTextNode(focusPath, textNodePath)) {
        console.debug("Moving focus to end of node")
        editor.moveFocusToEndOfNode(textNode)
    }
    if (anchorIsBeforeTextNode(anchorPath, textNodePath)) {
        console.debug("Moving anchor to start of node")
        editor.moveAnchorToStartOfNode(textNode)
    }
}

function focusIsAfterTextNode(focusPath, textNodePath) {
    return firstPathIsAfterSecond(focusPath, textNodePath)
}

function anchorIsBeforeTextNode(anchorPath, textNodePath) {
    return firstPathIsAfterSecond(textNodePath, anchorPath)
}

function firstPathIsAfterSecond(firstPath, secondPath) {
    let fIdx = 0
    let sIdx = 0
    while (fIdx < firstPath.size && sIdx < secondPath.size) {
        const f = firstPath.get(fIdx)
        const s = secondPath.get(sIdx)
        if (f > s) {
            return true
        } else if (f < s) {
            return false
        } else if (f == s) {
            fIdx++
            sIdx++
        }
    }
    if (firstPath.size > secondPath.size) {
        return true
    } else {
        return false
    }
}
