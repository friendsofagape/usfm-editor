import { nodeTypes, isInlineFormattingNodeType, isInlineNodeType } from "../utils/nodeTypeUtils";

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
        if (shouldAutoMergeWrappers(child, prev)) {
            editor.mergeNodeByKey(child.key)
            return
        }
    }
}

function shouldAutoMergeWrappers(node, prev) {
    const nodeType = node.type
    const prevNodeType = prev.type
    return (isInlineNodeType(nodeType) &&
                nodeType == prevNodeType) ||
            (nodeType == nodeTypes.TEXTWRAPPER && 
                prevNodeType == nodeTypes.P) ||
            isMergeOfEmptyTextWrapperIntoFormattingTag(node, prev)
}

export function isMergeWrappersAllowed(node, prev) {
    return !isInvalidMerge(node, prev)
}

function isInvalidMerge(node, prev) {
    return (prev.type == nodeTypes.ND ||
                node.type == nodeTypes.ND) && // Is at least one node an inline formatting node
            node.type != prev.type &&
            !isMergeOfEmptyTextWrapperIntoFormattingTag(node, prev)
}

function isMergeOfEmptyTextWrapperIntoFormattingTag(node, prev) {
    return node.type == nodeTypes.TEXTWRAPPER &&
        node.text == "" &&
        isInlineFormattingNodeType(prev.type)
} 