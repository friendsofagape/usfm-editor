import {Editor} from "slate-react";
import {createSlateNodeByType, nodeTypes} from "./jsonTransforms/usfmToSlate";
import {changeWrapperType} from "./keyHandlers";

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
                    changeWrapperType(editor, wrapper, nodeTypes.TEXTWRAPPER)
                    break
            }
        },
    }
}

function insertSectionHeader(editor) {
    const slateJson = createSlateNodeByType(nodeTypes.S, editor.value.fragment.text)
    editor.insertBlock(slateJson) // causes remove_text, split_node (x2), and insert_node to fire
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