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
            const slateJson = usfmToSlateJson(usfm, false)
            editor.insertBlock(slateJson) // causes remove_text, split_node (x2), and insert_node to fire
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
        if (!wrapperIsValid(value, selectedTextNode)) {
            console.log("Invalid selection")
            return false
        }
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

function wrapperIsValid(value, textNode) {
    const parent = value.document.getParent(textNode.key)
    const validParentTypes = ["textWrapper", "contentWrapper", "p", "nd"]
    return validParentTypes.includes(parent.type)
}