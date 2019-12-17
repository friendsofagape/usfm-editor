export const Normalize = () => ({
    normalizeNode: (node, editor, next) => {
        if (node.type == "verseBody") {
            checkAndMergeAdjacentTextWrappers(node.nodes, editor)
        }
        return next()
    }
})

function checkAndMergeAdjacentTextWrappers(nodes, editor) {
    for (let i = nodes.size - 1; i > 0; i--) {
        const child = nodes.get(i)
        const prev = nodes.get(i - 1)
        if (child.type == "textWrapper" && 
            (prev.type == "textWrapper" || prev.type == "p")) {
            mergeTextWrappers(child, prev, editor)
            return
        }
    }
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