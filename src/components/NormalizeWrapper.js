import {getAncestor} from '../utils/documentUtils';
import {createSlateNodeByType} from "./jsonTransforms/usfmToSlate";

/**
 * @param {Editor} editor 
 */
export function normalizeWrapper(editor, wrapper) {
    console.debug("running wrapper normalization")

    const parent = getAncestor(1, wrapper, editor.value.document)
    const indexOfWrapperInParent = parent.nodes.map(n => n.key).indexOf(wrapper.key)

    const N = wrapper.nodes.size;
    let insertNodeIdx = indexOfWrapperInParent + 1

    const firstChild = wrapper.nodes.get(0)
    if (firstChild.object != "text") {
        editor.removeNodeByKey(wrapperNode.key)
        throw new Error("First node in Wrapper was not text")
    }

    for (let i = 1; i < N; i++) {
        const thisChild = wrapper.nodes.get(i)

        if (isText(thisChild)) {
            moveToOwnWrapper(thisChild, wrapper.type, parent, editor, insertNodeIdx)
        }
        else {
            editor.moveNodeByKey(thisChild.key, parent.key, insertNodeIdx)
        }
        insertNodeIdx++
    }
}

function isText(node) {
    return node.object == "text"
}

function moveToOwnWrapper(textNode, nodeType, parent, editor, insertNodeIdx) {
    editor.removeNodeByKey(textNode.key)
    createWrapperAndInsert(
        parent,
        nodeType,
        editor,
        textNode.text,
        insertNodeIdx
    )
}

export function createWrapperAndInsert(
    parent,
    nodeType,
    editor,
    textToInsert,
    insertNodeIndex, 
) {
    const newChild = createSlateNodeByType(nodeType, textToInsert)
    editor.insertNodeByKey(parent.key, insertNodeIndex, newChild)
}