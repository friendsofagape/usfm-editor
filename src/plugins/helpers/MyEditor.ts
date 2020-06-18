import { Editor, Path, Node, NodeEntry } from 'slate'
import { NodeTypes } from '../../utils/NodeTypes'
import { ReactEditor } from 'slate-react'
import { DOMNode } from 'slate-react/dist/utils/dom'

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
    getPreviousVerse,
    getChapter,
    getLastVerse,
    getLastVerseNumberOrRange,
    getPathFromDOMNode
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
 * Returns undefined if there is no chapter currently selected
 */
function getVerse(editor: Editor, path: Path): NodeEntry | undefined {
    return Editor.above(
        editor,
        { 
            match: (node) => node.type == NodeTypes.VERSE,
            at: path
        }
    )
}

/**
 * Get the previous verse node (before the current selection),
 * optionally including the "front" verse (default is false)
 */
function getPreviousVerse(
    editor: Editor,
    path: Path,
    includeFront: boolean = false
): NodeEntry | undefined {
    const options = includeFront 
        ? { at: path }
        : { 
            match: _matchVerseByVerseNumberOrRange(
                (verseNum) => verseNum != "front"
            ),
            at: path
        }
    return Editor.previous(
        editor,
        options
    )
}

/**
 * Get the current chapter, using the current selection. 
 * Returns undefined if there is no chapter currently selected
 */
function getChapter(editor: Editor, path: Path): NodeEntry | undefined {
    return Editor.above(
        editor,
        { 
            match: (node) => node.type == NodeTypes.CHAPTER,
            at: path
        }
    )
}

/**
 * Get the last verse of the current chapter. 
 * Returns undefined if there is no chapter currently selected
 */
function getLastVerse(editor: Editor, path: Path): NodeEntry | undefined {
    const [chapter, chapterPath] = MyEditor.getChapter(editor, path) || [null, null]
    if (!chapter) {
        return undefined
    }
    const children = Node.children(
        chapter, 
        [],
        { reverse: true }
    )
    for (let child of children) {
        if (child[0].type == NodeTypes.VERSE) {
            return child
        }
    }
}

/**
 * Get the last verse number/range of the current chapter. 
 * Returns undefined if there is no chapter currently selected
 */
function getLastVerseNumberOrRange(editor: ReactEditor, path: Path): string | undefined {
    const [lastVerse, lastVersePath] = MyEditor.getLastVerse(editor, path) || [null, null]
    return lastVerse
        ? Node.string(lastVerse.children[0])
        : undefined
}

/**
 * Get the slate path for a given DOMNode 
 */
function getPathFromDOMNode(editor: ReactEditor, domNode: DOMNode): Path {
    const slateNode = ReactEditor.toSlateNode(editor, domNode)
    return ReactEditor.findPath(editor, slateNode)
}

/**
 * Returns a match function to find a verse whose verse 
 * number or range matches the given comparison function.
 */
function _matchVerseByVerseNumberOrRange(
    matchFcn: (verseNumberOrRange: string) => boolean
): ((n: Node) => boolean) {
    return node =>
        node.type == NodeTypes.VERSE &&
        node.children[0].type == NodeTypes.VERSE_NUMBER &&
        matchFcn(Node.string(node.children[0]))
}