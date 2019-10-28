import {getAncestor} from '../components/operationHandlers'
import {toSlateJson, toUsfmJsonNode} from "./jsonTransforms/usfmjsToSlate";

/**
 * @param {Editor} editor 
 */
export function normalizeTextWrapper(editor, wrapperNode) {
    console.debug("running textWrapper normalization")

    const parent = getAncestor(1, wrapperNode, editor.value.document)
    const indexOfWrapperInParent = parent.nodes.map(n => n.key).indexOf(wrapperNode.key)

    const N = wrapperNode.nodes.size;
    var insertNodeIdx = indexOfWrapperInParent
    var foundNonEmptyText = false
    for (var i = 0; i < N; i++) {
        const thisChild = wrapperNode.nodes.get(i)

        if (isNotText(thisChild)) {
            editor.moveNodeByKey(thisChild.key, parent.key, insertNodeIdx)
            insertNodeIdx++
        } else if (isEmptyText(thisChild)) {
            editor.removeNodeByKey(thisChild.key)
        } else if (isFirstRealText(thisChild, foundNonEmptyText)) {
            foundNonEmptyText = true
            insertNodeIdx++
        } else if (isAnotherText(thisChild, foundNonEmptyText)) {
            moveToOwnTextWrapper(thisChild, parent, editor, insertNodeIdx)
            insertNodeIdx++
        }        
    }
    if (!foundNonEmptyText) {
        editor.removeNodeByKey(wrapperNode.key)
    }
}

function isText(node) {
    return node.object == "text"
}

function isNotText(node) {
    return !isText(node)
}

function isEmptyText(node) {
    return isText(node) && !node.text.trim()
}

function isFirstRealText(node, foundNonEmptyText) {
    return isText(node) && !foundNonEmptyText
}

function isAnotherText(node, foundNonEmptyText) {
    return isText(node) && foundNonEmptyText
}

function moveToOwnTextWrapper(node, parent, editor, insertNodeIdx) {
    editor.removeNodeByKey(node.key)
    createTextWrapperAndInsert(
        parent,
        editor,
        node,
        insertNodeIdx
    )
}

function createTextWrapperAndInsert(
    parent,
    editor,
    child,
    insertNodeIndex, 
) {
    const newChildSource = toUsfmJsonNode(child.text)
    const newChild = toSlateJson(newChildSource)
    editor.insertNodeByKey(parent.key, insertNodeIndex, newChild)
}