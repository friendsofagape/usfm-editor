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
 * Find the verse corresponding to the given verse number/range.
 * The current selection is implicitly used in the methods called on the Editor.
 */
function getVerse(
    editor: Editor,
    verseNumberOrRange: string
): NodeEntry {
    const matchFcn = matchVerseByVerseNumberOrRange(
        (verseNum) => verseNum == verseNumberOrRange
    )
    const matchingVerseAbove = Editor.above(
        editor,
        { match: matchFcn }
    )
    if (matchingVerseAbove) {
        return matchingVerseAbove
    } else {
        // If the verse above is not the desired verse, it should be the next one.
        const nextVerse = Editor.next(
            editor,
            { 
                // matchFcn does not work here. It fails on the string compare
                // with verseNumberOrRange. The reason is unknown.
                match: (node) => node.type == NodeTypes.VERSE
            }
        )
        if (Node.string(nextVerse[0].children[0]) == verseNumberOrRange) {
            return nextVerse
        } else {
            console.error("Could not find the desired verse based on the current selection")
        }
    }
}

/**
 * Find the previous verse node, starting at the currently selected node
 * and ignoring "front" verses
 */
function getPreviousVerse(
    editor: Editor,
    verseNumberOrRange: string
): NodeEntry | undefined {
    const [thisVerse, path] = getVerse(editor, verseNumberOrRange)
    const matchNotFront = matchVerseByVerseNumberOrRange(
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
function matchVerseByVerseNumberOrRange(
    matchFcn: (verseNumberOrRange: string) => boolean
): ((n: Node) => boolean) {
    return node =>
        node.type == NodeTypes.VERSE &&
        node.children[0].type == NodeTypes.VERSE_NUMBER &&
        matchFcn(Node.string(node.children[0])) // this is not reliable!!! The reason is unknown.
}