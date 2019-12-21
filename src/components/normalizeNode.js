import { nodeTypes } from "./jsonTransforms/usfmToSlate"

export const Normalize = () => ({
    normalizeNode: (node, editor, next) => {
        if (node.type == "verseBody") {
            checkAndMergeAdjacentWrappers(node.nodes, editor)
        }
        return next()
    }
})

function checkAndMergeAdjacentWrappers(nodes, editor) {
    for (let i = nodes.size - 1; i > 0; i--) {
        const child = nodes.get(i)
        const prev = nodes.get(i - 1)
        if (isMergeWrappersAllowed(child, prev)) {
            editor.mergeNodeByKey(child.key)
            return
        }
    }
}

export function isMergeWrappersAllowed(node, prev) {
    const nodeType = node.type
    const prevNodeType = prev.type
    return (nodeType == nodeTypes.TEXTWRAPPER && 
                prevNodeType == nodeTypes.TEXTWRAPPER) ||
            (nodeType == nodeTypes.TEXTWRAPPER && 
                prevNodeType == nodeTypes.P) ||
            (nodeType == nodeTypes.ND && 
                prevNodeType == nodeTypes.ND) ||
            isMergeOfEmptyTextWrapperIntoFormattingTag(node, prev)
}

function isMergeOfEmptyTextWrapperIntoFormattingTag(node, prev) {
    return node.type == "textWrapper" &&
        node.text == "" &&
        prev.type == "nd"
} 