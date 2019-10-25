import {getAncestor} from '../components/operationHandlers'
import {toSlateJson, toUsfmJsonNode} from "./jsonTransforms/usfmjsToSlate";

/**
 * @param {Editor} editor 
 */
export function normalizeTextWrapper(editor, wrapperNode) {
    console.debug("running textWrapper normalization")

    const parent = getAncestor(1, wrapperNode, editor.value.document)
    const indexOfWrapperInParent = parent.nodes.map(n => n.key).indexOf(wrapperNode.key)

    // Have to loop here over all children at once. If we remove a child and run the normalizer again,
    //  children will be added to the parent at incorrect indices.
    var N = wrapperNode.nodes.size;
    for (var i = 1; i < N; i++) {
        const thisChild = wrapperNode.nodes.get(i)
        const insertNodeIndex = indexOfWrapperInParent + i

        if (thisChild.object == "text") {
            editor.removeNodeByKey(thisChild.key)
            createTextWrapperAndInsert(
                parent,
                editor,
                thisChild,
                insertNodeIndex
            )
        } else {
            editor.moveNodeByKey(thisChild.key, parent.key, insertNodeIndex)
        }
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