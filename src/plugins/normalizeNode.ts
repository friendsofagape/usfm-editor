import { Editor, Transforms, NodeEntry } from 'slate'
import { NodeTypes } from '../utils/NodeTypes'
import { emptyInlineContainer } from '../transforms/basicSlateNodeFactory'

export const withNormalize = (editor: Editor) => {
    const { normalizeNode } = editor

    editor.normalizeNode = (entry) => {
        customNormalizeNode(editor, entry)
        return normalizeNode(entry)
    }

    return editor
}

const customNormalizeNode = (editor: Editor, entry: NodeEntry) => {
    const [node, path] = entry
    if (node.type === NodeTypes.VERSE) {
        // The second child node of a verse block must be an inline container
        // (The first child node is the verseNumber)
        if (node.children.length < 2 ||
            node.children[1].type != NodeTypes.INLINE_CONTAINER
        ) {
            const inlineContainer = emptyInlineContainer()
            Transforms.insertNodes(editor, inlineContainer, { at: path.concat(1) })
        }
    }
}