import { Editor, Path, Node, NodeEntry } from 'slate'
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
    getVerse,
    getPreviousVerse
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
 * Get the verse corresponding to the selected element
 */
function getVerse(editor: Editor): NodeEntry {
    return Editor.above(
        editor,
        { match: (node) => node.type == NodeTypes.VERSE }
    )
}

/**
 * Get the previous verse node (before the current selection),
 * optionally including the "front" verse (default is false)
 */
function getPreviousVerse(
    editor: Editor,
    includeFront: boolean = false
): NodeEntry | undefined {
    const options = includeFront 
        ? {}
        : { 
            match: matchVerseByVerseNumberOrRange(
                (verseNum) => verseNum != "front"
            )
        }
    return Editor.previous(
        editor,
        options
    )
}

/**
 * Returns a match function to find a verse whose verse 
 * number or range matches the given comparison function.
 */
function matchVerseByVerseNumberOrRange(
    matchFcn: (verseNumberOrRange: string) => boolean
): ((n: Node) => boolean) {
    return node =>
        node.type == NodeTypes.VERSE &&
        node.children[0].type == NodeTypes.VERSE_NUMBER &&
        matchFcn(Node.string(node.children[0]))
}