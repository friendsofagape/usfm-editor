import {getAncestor, getSource, getSourceParentArray} from '../components/operationHandlers'
import {toSlateJson, toUsfmJsonNode} from "./jsonTransforms/usfmjsToSlate";

export function normalizeTextWrapper(editor, wrapperNode) {
    console.debug("running textWrapper normalization")

    const {parent, indexOfWrapperInParent, sourceParentArray, wrapperSourceIndex} = 
        extractConstants(editor, wrapperNode); 

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
                sourceParentArray,
                wrapperSourceIndex + i,
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
    sourceParentArray,
    insertSourceIndex,
    insertNodeIndex, 
) {
    const newChildSource = toUsfmJsonNode(child.text)
    sourceParentArray.splice(insertSourceIndex, 0, newChildSource)

    const newChild = toSlateJson(newChildSource)
    editor.insertNodeByKey(parent.key, insertNodeIndex, newChild)
}

function extractConstants(editor, wrapperNode) {
    const parent = getAncestor(1, wrapperNode, editor.value.document)
    const indexOfWrapperInParent = parent.nodes.map(n => n.key).indexOf(wrapperNode.key)

    const wrapperSource = getSource(wrapperNode)
    const sourceParentArray = getSourceParentArray(editor.value, wrapperNode)
    const wrapperSourceIndex = sourceParentArray.findIndex(obj => obj == wrapperSource)

    return {parent, indexOfWrapperInParent, sourceParentArray, wrapperSourceIndex}
}