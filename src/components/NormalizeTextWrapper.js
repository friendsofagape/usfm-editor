import {getAncestor} from '../components/operationHandlers'
import {toSlateJson} from "./jsonTransforms/usfmjsToSlate";

/**
 * @param {Editor} editor 
 */
export function normalizeTextWrapper(editor, wrapperNode) {
    console.debug("running textWrapper normalization")

    const parent = getAncestor(1, wrapperNode, editor.value.document)
    const indexOfWrapperInParent = parent.nodes.map(n => n.key).indexOf(wrapperNode.key)

    const N = wrapperNode.nodes.size;
    var insertNodeIdx = indexOfWrapperInParent + 1

    const firstChild = wrapperNode.nodes.get(0)
    if (firstChild.object != "text") {
        editor.removeNodeByKey(wrapperNode.key)
        throw new Error("First node in textWrapper was not text")
    }

    for (var i = 1; i < N; i++) {
        const thisChild = wrapperNode.nodes.get(i)

        if (isNotText(thisChild)) {
            editor.moveNodeByKey(thisChild.key, parent.key, insertNodeIdx)
            insertNodeIdx++
        } else if (isEmptyText(thisChild)) {
            // Text nodes that are empty are generally the result of a split at the edge of a
            // textWrapper and not a functionally useful non-breaking space, so remove them
            editor.removeNodeByKey(thisChild.key)
        } else if (isNonEmptyText(thisChild)) {
            moveToOwnTextWrapper(thisChild, parent, editor, insertNodeIdx)
            insertNodeIdx++
        }
    }
    if (isEmptyText(firstChild)) {
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

function isNonEmptyText(node) {
    return isText(node) && node.text.trim()
}

function moveToOwnTextWrapper(node, parent, editor, insertNodeIdx) {
    editor.removeNodeByKey(node.key)
    createTextWrapperAndInsert(
        parent,
        editor,
        node.text,
        insertNodeIdx
    )
}

export function createTextWrapperAndInsert(
    parent,
    editor,
    text,
    insertNodeIndex, 
) {
    const newChildSource = {type: "text", text: text.trim() ? text : "\r\n"}
    const newChild = toSlateJson(newChildSource)
    editor.insertNodeByKey(parent.key, insertNodeIndex, newChild)
}