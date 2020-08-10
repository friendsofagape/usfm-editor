import { Editor, Path, Node, NodeEntry } from 'slate'
import NodeTypes from '../../utils/NodeTypes'
import { ReactEditor } from 'slate-react'
import { DOMNode } from 'slate-react/dist/utils/dom'
import { parseIdentificationFromSlateTree } from '../../transforms/identificationTransforms'
import { UsfmMarkers }from '../../utils/UsfmMarkers'

export const MyEditor = {
    ...Editor,
    isMatchingNodeSelected,
    isVerseOrChapterNumberSelected,
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
    getPathFromDOMNode,
    identification
}

function isMatchingNodeSelected(
    editor: Editor, 
    matchFcn: ((node: Node) => boolean) | ((node: Node) => node is Node)
) {
    const [match] = Editor.nodes(editor, {
        match: matchFcn
    })
    return !!match
}

function isVerseOrChapterNumberSelected(editor: Editor) {
    return isMatchingNodeSelected(
        editor,
        n => UsfmMarkers.isVerseOrChapterNumber(n.type) 
    )
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
        UsfmMarkers.isVerseOrChapterNumber(block.type)
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
 * Get the verse corresponding to the given path.
 * The verse node must be above the given path in the slate tree.
 */
function getVerse(editor: Editor, path: Path): NodeEntry {
    return Editor.above(
        editor,
        {
            match: (node) => node.type == NodeTypes.VERSE,
            at: path
        }
    )
}

/**
 * Get the previous verse node (before the given path),
 * optionally including the "front" verse (default is false)
 */
function getPreviousVerse(
    editor: Editor,
    path: Path,
    includeFront: boolean = false
): NodeEntry {
    const matchOption = includeFront
        ? {}
        : { 
            match: _matchVerseByVerseNumberOrRange(
                (verseNum) => verseNum != "front"
            )
        }
    return Editor.previous(
        editor,
        {
            at: path,
            ...matchOption
        }
    )
}

/**
 * Get the chapter corresponding to the given path.
 * The chapter node must be above the given path in the slate tree.
 */
function getChapter(
    editor: Editor,
    path: Path
): NodeEntry {
    return Editor.above(
        editor,
        {
            match: (node) => node.type == NodeTypes.CHAPTER,
            at: path
        }
    )
}

/**
 * Get the last verse of the chapter above the given path.
 */
function getLastVerse(
    editor: Editor,
    path: Path
): NodeEntry {
    const [chapter, chapterPath] = MyEditor.getChapter(editor, path)
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
 * Get the last verse number/range (string) of the chapter above the given path.
 */
function getLastVerseNumberOrRange(
    editor: Editor,
    path: Path
): string {
    const [lastVerse, lastVersePath] = MyEditor.getLastVerse(editor, path)
    return Node.string(lastVerse.children[0])
}

/**
 * Get the slate path for a given DOMNode 
 */
function getPathFromDOMNode(
    editor: ReactEditor,
    domNode: DOMNode
): Path {
    const slateNode = ReactEditor.toSlateNode(editor, domNode)
    return ReactEditor.findPath(editor, slateNode)
}

/**
 * Gets the identification headers in json format
 */
function identification(editor: Editor): Object { 
    return parseIdentificationFromSlateTree(editor)
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
        node.children[0].type == UsfmMarkers.CHAPTERS_AND_VERSES.v &&
        matchFcn(Node.string(node.children[0]))
}