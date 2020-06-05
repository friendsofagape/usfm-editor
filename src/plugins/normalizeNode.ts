import { Editor, Transforms, NodeEntry, Node } from 'slate'
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
        addInlineContainerIfMissing(editor, entry)
        mergeAdjacentInlineContainers(editor, entry)
    }
}

function mergeAdjacentInlineContainers(editor: Editor, verseNodeEntry: NodeEntry) {
    const [node, path] = verseNodeEntry
    for (let i = node.children.length-1; i > 0; i--) {
        const child = node.children[i]
        const prevChild = node.children[i-1]
        if (child.type === NodeTypes.INLINE_CONTAINER &&
            prevChild.type === NodeTypes.INLINE_CONTAINER
        ) {
            Transforms.mergeNodes(
                editor,
                { at: path.concat(i) }
            )
        }
    }
}

/**
 * If a verse node has a verseNumber (this will be the first child),
 * then the second child node of the verse must be an inline container.
 * There may not be a verseNumber if there is a pending transformation, such as
 * a verse join.
 */
function addInlineContainerIfMissing(editor: Editor, verseNodeEntry: NodeEntry) {
    const [node, path] = verseNodeEntry
    if (nodeHasVerseNumberButMissingInlineContainer(node)) {
        const inlineContainer = emptyInlineContainer()
        Transforms.insertNodes(
            editor, 
            inlineContainer, 
            { at: path.concat(1) }
        )
    }
}

function nodeHasVerseNumberButMissingInlineContainer(node: Node) {
    return node.children.length > 0 &&
        node.children[0].type === NodeTypes.VERSE_NUMBER &&
        (node.children.length < 2 ||
            node.children[1].type != NodeTypes.INLINE_CONTAINER)
}