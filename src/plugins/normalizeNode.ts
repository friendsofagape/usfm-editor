import { Editor, Transforms, NodeEntry, Node, Path } from 'slate'
import NodeTypes from '../utils/NodeTypes'
import { emptyInlineContainer } from '../transforms/basicSlateNodeFactory'
import { UsfmMarkers }from '../utils/UsfmMarkers'
import NodeRules from '../utils/NodeRules'

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
        const modified = addInlineContainerIfMissing(editor, entry)
        if (modified) return
        transformExcessInlineContainers(editor, entry)
    }
}

/**
 * Each verse should only contain one inline container, at index 1.
 * Extra inline containers should be handled according to the preceding
 * block node.
 */
function transformExcessInlineContainers(
    editor: Editor, 
    verseNodeEntry: NodeEntry
) {
    const [verse, versePath] = verseNodeEntry
    // Search the verse for inline containers
    for (let i = verse.children.length-1; i > 0; i--) {
        const child = verse.children[i]
        if (child.type !== NodeTypes.INLINE_CONTAINER) {
            continue
        }
        const path = versePath.concat(i)
        const prevChild = verse.children[i-1]
        if (NodeRules.canMergeAIntoB(
                NodeTypes.INLINE_CONTAINER, 
                prevChild.type
        )) {
            mergeAndAssumePreviousNodeType(editor, path)
        } else if (i > 1) {
            setToParagraphType(editor, path)
        }
    }
}

function mergeAndAssumePreviousNodeType(editor: Editor, path: Path) {
    const [prevChild, prevPath] = Editor.node(editor, Path.previous(path))
    Editor.withoutNormalizing(editor, () => {
        Transforms.mergeNodes(
            editor,
            { at: path }
        )
        Transforms.setNodes(
            editor,
            { type: prevChild.type },
            { at: Path.previous(path) }
        )
    })
}

function setToParagraphType(editor: Editor, path: Path) {
    Transforms.setNodes(
        editor,
        { type: UsfmMarkers.PARAGRAPHS.p },
        { at: path }
    )
}

/**
 * If a verse node has a verseNumber (this will be the first child),
 * then the second child node of the verse must be an inline container.
 * There may not be a verseNumber if there is a pending transformation, such as
 * a verse join.
 * @returns true if an inline container was added.
 */
function addInlineContainerIfMissing(
    editor: Editor, 
    verseNodeEntry: NodeEntry
): boolean {
    const [node, path] = verseNodeEntry
    if (nodeHasVerseNumberButMissingInlineContainer(node)) {
        const inlineContainer = emptyInlineContainer()
        Transforms.insertNodes(
            editor, 
            inlineContainer, 
            { at: path.concat(1) }
        )
        return true
    }
    return false
}

function nodeHasVerseNumberButMissingInlineContainer(node: Node) {
    return node.children.length > 0 &&
        node.children[0].type === UsfmMarkers.CHAPTERS_AND_VERSES.v &&
        (node.children.length < 2 ||
            node.children[1].type != NodeTypes.INLINE_CONTAINER)
}