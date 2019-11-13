import {getPreviousInlineSibling} from "../utils/documentUtils"

export const Normalize = () => ({
    normalizeNode: (node, editor, next) => {
        if (nodeIsTextWrapper(node)) {
            checkAndMergeAdjacentTextWrappers(editor, node)
        }
        return next()
    }
})

function checkAndMergeAdjacentTextWrappers(editor, node) {
    const prev = getPreviousInlineSibling(editor.value.document, node)
    if (prev && nodeIsTextWrapper(prev)) {
        mergeTextWrappers(node, prev, editor)
    }
}

function nodeIsTextWrapper(node) {
    return node.type && node.type == "textWrapper"
}

function mergeTextWrappers(wrapper, prevWrapper, editor) {
    console.info("Merging adjacent textWrappers")
    console.info("     textWrapper", wrapper.toJS())
    console.info("     previous textWrapper", prevWrapper.toJS())
    console.info("     document", editor.value.document.toJS())

    const textNode = wrapper.nodes.get(0)
    const prevTextNode = prevWrapper.nodes.get(0)
    const offset = prevTextNode.text.length

    editor.insertTextByKey(prevTextNode.key, offset, textNode.text)
    editor.moveTo(prevTextNode.key, offset)
    editor.removeNodeByKey(wrapper.key)
}