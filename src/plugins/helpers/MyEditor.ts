import { Editor, Path, Node, NodeEntry, Location, Span } from 'slate'
import { NodeTypes } from '../../utils/NodeTypes'

export const MyEditor = {
    ...Editor,
    areMultipleBlocksSelected,
    isNearbyBlockAnInlineContainer,
    isNearbyBlockAnEmptyInlineContainer,
    isNearbyBlockAVerseOrChapterNumberOrNull,
    getPreviousBlock,
    getCurrentBlock,
    getNextBlock,
    findNode,
    findVerse,
    previousVerse
}

function areMultipleBlocksSelected(editor: Editor) {
    const { selection } = editor
    if (!selection) return false
    const anchorParent = Path.parent(selection.anchor.path)
    const focusParent = Path.parent(selection.focus.path)
    return !Path.equals(anchorParent, focusParent)
}

function isNearbyBlockAnInlineContainer(
    editor: Editor,
    direction: 'previous' | 'current' | 'next'
) {
    const [block, blockPath] = getNearbyBlock(editor, direction)
    return block &&
        block.type == NodeTypes.INLINE_CONTAINER
}

function isNearbyBlockAnEmptyInlineContainer(
    editor: Editor,
    direction: 'previous' | 'current' | 'next'
) {
    const [block, blockPath] = getNearbyBlock(editor, direction)
    return block &&
        block.type == NodeTypes.INLINE_CONTAINER &&
        Node.string(block) === ""
}

function isNearbyBlockAVerseOrChapterNumberOrNull(
    editor: Editor,
    direction: 'previous' | 'current' | 'next'
) {
    const [block, blockPath] = getNearbyBlock(editor, direction)
    return !block ||
        NodeTypes.isVerseOrChapterNumberType(block.type)
}

/**
 * Finds the parent block of the text node at the current selection's anchor point,
 * then returns the previous node
 */
function getPreviousBlock(editor: Editor) {
    return getNearbyBlock(editor, 'previous')
}

/**
 * Finds the parent block of the text node at the current selection's anchor point
 */
function getCurrentBlock(editor: Editor) {
    return getNearbyBlock(editor, 'current')
}

/**
 * Finds the parent block of the text node at the current selection's anchor point,
 * then returns the next node
 */
function getNextBlock(editor: Editor) {
    return getNearbyBlock(editor, 'next')
}

/**
 * Finds the parent block of the text node at the current selection's anchor point,
 * then returns a node based on the direction:
 *   'current' returns this parent block
 *   'previous' returns the previous sibling of the parent block
 *   'next' returns the next sibling of the parent block
 */
function getNearbyBlock(
    editor: Editor,
    direction: 'previous' | 'current' | 'next' = 'current'
): NodeEntry {
    const { selection } = editor
    const [node, path] = Editor.node(editor, selection.anchor)
    const [parent, parentPath] = Editor.parent(editor, path)

    return direction === 'current'
        ? [parent, parentPath]
        : direction === 'previous'
            ? Editor.previous(editor, { at: parentPath }) || [null, null]
            : Editor.next(editor, { at: parentPath }) || [null, null]
}

/**
 * Find a single node. This function takes the same arguments as slate's Editor.nodes
 * function, but only returns a single node entry.
 */
function findNode<T extends Node>(
    editor: Editor,
    options: {
        at?: Location | Span
        match?: NodeMatch<T>
        mode?: 'all' | 'highest' | 'lowest'
        universal?: boolean
        reverse?: boolean
        voids?: boolean
    } = {}
): NodeEntry<T> {
    const iterable: Iterable<NodeEntry<T>> = Editor.nodes(
        editor,
        options
    )
    let found = undefined
    for (let node of iterable) {
        if (found) {
            console.error("findNode found more than one node!")
        } else {
            found = node
        }
    }
    return found
}

/**
 * Find the verse node with the given verse number or range 
 */
function findVerse(
    editor: Editor,
    verseNumberOrRange: string
): NodeEntry {
    const matchFcn = matchVerseByVerseNumber(
        (verseNum) => verseNum === verseNumberOrRange
    )
    return MyEditor.findNode(
        editor,
        { 
            match: matchFcn,
            at: [] // will search all nodes
        }
    )
}

/**
 * Find the verse node that comes before a verse with the given verse number or range
 */
function previousVerse(
    editor: Editor,
    verseNumberOrRange: string
): NodeEntry | undefined {
    const [thisVerse, path] = MyEditor.findVerse(editor, verseNumberOrRange)

    const matchNotFront = matchVerseByVerseNumber(
        (verseNum) => verseNum != "front"
    )
    return Editor.previous(
        editor,
        { 
            match: matchNotFront,
            at: path
        }
    )
}

/**
 * Returns a match function to find a verse with a given verse number or range 
 */
function matchVerseByVerseNumber(
    matchFcn: (verseNumberOrRange: string) => boolean
): ((n: Node) => boolean) {
    return node =>
        node.type === NodeTypes.VERSE &&
        node.children[0].type === NodeTypes.VERSE_NUMBER &&
        matchFcn(Node.string(node.children[0]))
}

/**
 * A helper type for narrowing matched nodes with a predicate.
 * This is copied from the slate source code
 * https://github.com/ianstormtaylor/slate/blob/master/packages/slate/src/interfaces/editor.ts
 */
type NodeMatch<T extends Node> =
  | ((node: Node) => node is T)
  | ((node: Node) => boolean)