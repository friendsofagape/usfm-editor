export const nodeTypes = {
    TEXTWRAPPER: "textWrapper",
    P: "p",
    ND: "nd",
    S: "s"
}

const inlineFormattingNodeTypes = [
    nodeTypes.ND
]

const inlineNodeTypes = [
    nodeTypes.TEXTWRAPPER
].concat(inlineFormattingNodeTypes)

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