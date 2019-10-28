import {getAncestor} from '../components/operationHandlers'
import {toSlateJson, toUsfmJsonNode} from "./jsonTransforms/usfmjsToSlate";

function isEmptyText(node) {
    return node.object == "text" && !node.text.trim()
}
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
        if (thisChild.object == "text") {
            if (isEmptyText(thisChild)) {
                editor.removeNodeByKey(thisChild.key)
            } else {
                if (foundNonEmptyText) {
                    editor.removeNodeByKey(thisChild.key)
                    createTextWrapperAndInsert(
                        parent,
                        editor,
                        thisChild,
                        insertNodeIdx
                    )
                } else {
                    foundNonEmptyText = true
                }
                insertNodeIdx++
            }
        } else {
            editor.moveNodeByKey(thisChild.key, parent.key, insertNodeIdx)
            insertNodeIdx++
        }
    }
    if (!foundNonEmptyText) {
        editor.removeNodeByKey(wrapperNode.key)
    }
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