import { nodeTypes, isInlineFormattingNodeType, isInlineNodeType } from "../utils/nodeTypes";

export const Normalize = () => ({
    normalizeNode: (node, editor, next) => {
        if (node.type == "verseBody") {
            checkAndMergeAdjacentWrappers(node.nodes, editor)
        }
        return next()
    }
})

export function isValidMergeAtPath(document, path) {
    const node = document.getNode(path)
    const prevNode = document.getPreviousSibling(path)
    const nextNode = document.getNextSibling(path)
    if (node.has("text") && prevNode.has("text")) {
        return true
    } else if (node.has("type") && prevNode.has("type")) { // nextNode is allowed to be null
        return isValidMerge(node, prevNode, nextNode)
    } else {
        return false
    }
}

function checkAndMergeAdjacentWrappers(nodes, editor) {
    for (let i = nodes.size - 1; i > 0; i--) {
        const child = nodes.get(i)
        const prev = nodes.get(i - 1)
        const next = i + 1 < nodes.size ? nodes.get(i + 1) : null
        if (shouldAutoMergeWrappers(child, prev, next)) {
            editor.mergeNodeByKey(child.key)
            return
        }
    }
}

function shouldAutoMergeWrappers(node, prev, next) {
    const nodeType = node.type
    const prevNodeType = prev.type
    return (isInlineNodeType(nodeType) &&
                nodeType == prevNodeType) ||
            (nodeType == nodeTypes.TEXTWRAPPER && 
                prevNodeType == nodeTypes.P) ||
            isMergeOfEmptyTextWrapperBetweenFormattingTags(node, prev, next)
}

function isValidMerge(node, prev, next) {
    return !isInvalidMerge(node, prev, next)
}

function isInvalidMerge(node, prev, next) {
    return (isInlineFormattingNodeType(prev.type) ||
                isInlineFormattingNodeType(node.type)) &&
            node.type != prev.type &&
            !isMergeOfEmptyTextWrapperBetweenFormattingTags(node, prev, next)
}

function isMergeOfEmptyTextWrapperBetweenFormattingTags(node, prev, next) {
    return node.type == nodeTypes.TEXTWRAPPER &&
        node.text == "" &&
        isInlineFormattingNodeType(prev.type) &&
        next &&
        next.type == prev.type
} 