
export function customNormalizeNode(editor, entry, defaultNormalizeNode) {
    defaultNormalizeNode(entry)
}

export function runInitialNormalize(editor) {
    // Currently, this doesn't work. Sometimes, it cannot find the node
    // at the specified path and throws an error. If we surround this with
    // a try-catch, the initial normalizations succeed, but then no further 
    // normalizations can be done as the user interacts with the document.

    // console.info("Running initial normalize")
    // for (const [node, path] of Editor.nodes(editor, { at: [] })) {
        // editor.normalizeNode([node, path])
    // }
}