import {Editor} from "slate-react";
import {usfmToSlateJson} from "./jsonTransforms/usfmToSlate";
import {replaceTagWithTextWrapper} from "./keyHandlers";

const actionTypes = {
    INSERT: 'insert',
    REMOVE: 'remove',
    INVALID: 'invalid'
}

export const SectionHeaderPlugin = {

    commands: {
        /**
         * @param {Editor} editor 
         */
        insertOrRemoveSectionHeader(editor) {
            const {actionType, wrapper} = getActionTypeAndWrapper(editor)
            switch(actionType) {
                case actionTypes.INVALID:
                    return
                case actionTypes.INSERT:
                    insertSectionHeader(editor)
                    break
                case actionTypes.REMOVE:
                    removeSectionHeader(editor, wrapper)
                    break
            }
        },

        shouldShowSectionButtonCommand(editor) {
            console.log("************calling", validateSelection(editor))
            return validateSelection(editor)
        }
    }
}

function insertSectionHeader(editor) {
    const usfm = "\\s " + editor.value.fragment.text
    const slateJson = usfmToSlateJson(usfm, false)
    editor.insertBlock(slateJson) // causes remove_text, split_node (x2), and insert_node to fire
}

function removeSectionHeader(editor, wrapper) {
    const amount = wrapper.nodes.get(0).text.length

    replaceTagWithTextWrapper(editor, wrapper)

    const newSelectionOffset = editor.value.selection.anchor.offset
    console.log("new offset ", newSelectionOffset)
    const updatedNode = editor.value.document.getNode(editor.value.selection.anchor.path)
    console.log("updated node ", updatedNode.toJS())
    if (newSelectionOffset < updatedNode.text.length) {
        console.log("Moving forward")
        editor.moveFocusForward(amount)
    } else {
        console.log("Moving backward")
        editor.moveFocusBackward(amount)
    }
    console.log("amount ", amount)
}

function getActionTypeAndWrapper(editor) {
    const {value} = editor

    if (selectedTextIsEmpty(value)) {
        console.log("Must select non-empty text to create a section header")
        return actionTypes.INVALID
    }

    const textNodes = getSelectedTextNodes(value)
    if (textNodes.size != 1) {
        console.log("Must select exactly one node with text to create a section header")
        return actionTypes.INVALID
    } 
    
    const selectedTextNode = textNodes.get(0)
    const wrapper = value.document.getParent(selectedTextNode.key)
    const actionType = getActionType(wrapper)
    return {actionType, wrapper}
}

function getActionType(wrapper) {
    const validParentTypes = ["textWrapper", "contentWrapper", "p", "nd", "s"]
    let actionType = null
    if (wrapper.type == "s") {
        actionType = actionTypes.REMOVE
    } else if (validParentTypes.includes(wrapper.type)) {
        actionType = actionTypes.INSERT
    } else {
        console.log("Invalid selection")
        actionType = actionTypes.INVALID
    }
    return actionType
}

function selectedTextIsEmpty(value) {
    return !value.fragment.text.trim()
}

function getSelectedTextNodes(value) {
    const range = value.selection.toRange()
    return value.document.getTextsAtRange(range)
}