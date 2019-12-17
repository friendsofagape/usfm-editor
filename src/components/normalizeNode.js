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
        if (child.type == "textWrapper" && 
            (prev.type == "textWrapper" || prev.type == "p")) {
            mergeWrappers(child, prev, editor)
            return
        }
    }
}

function mergeWrappers(wrapper, prevWrapper, editor) {
    console.info("Merging adjacent wrappers")
    console.info("     wrapper", wrapper.toJS())
    console.info("     previous wrapper", prevWrapper.toJS())
    console.info("     document", editor.value.document.toJS())

    const textNode = wrapper.nodes.get(0)
    const prevTextNode = prevWrapper.nodes.get(0)
    const offset = prevTextNode.text.length

    editor.insertTextByKey(prevTextNode.key, offset, textNode.text)
    editor.moveTo(prevTextNode.key, offset)
    editor.removeNodeByKey(wrapper.key)
}