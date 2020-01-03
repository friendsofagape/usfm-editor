export const nodeTypes = {
    TEXTWRAPPER: "textWrapper",
    P: "p",
    ND: "nd",
    S: "s"
}

/**
 * These nodes demand special formatting and have the
 * characteristics of "inline" nodes as defined below
 */
const inlineFormattingNodeTypes = [
    nodeTypes.ND
]

/**
 * Not truly "inline" nodes, but nodes that appear as such
 * and do NOT start on a new line
 */
const inlineNodeTypes = [
    nodeTypes.TEXTWRAPPER
].concat(inlineFormattingNodeTypes)

/**
 * Nodes that start on a new line 
 */
const newlineNodeTypes = [
    nodeTypes.P,
    nodeTypes.S
]

export function isInlineFormattingNodeType(type) {
    return inlineFormattingNodeTypes.includes(type)
}

export function isInlineNodeType(type) {
    return inlineNodeTypes.includes(type)
}

export function isNewlineNodeType(type) {
    return newlineNodeTypes.includes(type)
}