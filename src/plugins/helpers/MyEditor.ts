import { Editor, Path, Node, NodeEntry } from 'slate'
import NodeTypes from '../../utils/NodeTypes'
import { ReactEditor } from 'slate-react'
import { DOMNode } from 'slate-react/dist/utils/dom'
import { parseIdentificationFromSlateTree } from '../../transforms/identificationTransforms'
import { UsfmMarkers }from '../../utils/UsfmMarkers'
import { IdentificationHeaders } from '../../UsfmEditor'

export const MyEditor = {
    ...Editor,
    isMatchingNodeSelected,
    isVerseOrChapterNumberSelected,
    areMultipleBlocksSelected,
    isNearbyBlockAnInlineContainer,
    isNearbyBlockAnEmptyInlineContainer,
    isNearbyBlockAVerseNumber,
    isNearbyBlockAVerseOrChapterNumberOrNull,
    getPreviousBlock,
    getCurrentBlock,
    getNextBlock,
    getVerseNode,
    getPreviousVerse,
    getChapterNode,
    getLastVerse,
    getLastVerseNumberOrRange,
    getPathFromDOMNode,
    identification,
    findVersePath
}

function isMatchingNodeSelected(
    editor: Editor, 
    matchFcn: ((node: Node) => boolean) | ((node: Node) => node is Node)
): boolean {
    const [match] = Editor.nodes(editor, {
        match: matchFcn
    })
    return !!match
}

function isVerseOrChapterNumberSelected(editor: Editor): boolean {
    return isMatchingNodeSelected(editor, UsfmMarkers.isVerseOrChapterNumber)
}

function areMultipleBlocksSelected(editor: Editor): boolean {
    const { selection } = editor
    if (!selection) return false
    const anchorParent = Path.parent(selection.anchor.path)
    const focusParent = Path.parent(selection.focus.path)
    return !Path.equals(anchorParent, focusParent)
}

function isNearbyBlockAnInlineContainer(
    editor: Editor,
    direction: 'previous' | 'current' | 'next'
): boolean {
    const [block] = getNearbyBlock(editor, direction)
    return block &&
        block.type == NodeTypes.INLINE_CONTAINER
}

function isNearbyBlockAnEmptyInlineContainer(
    editor: Editor,
    direction: 'previous' | 'current' | 'next'
): boolean {
    const [block] = getNearbyBlock(editor, direction)
    return block &&
        block.type == NodeTypes.INLINE_CONTAINER &&
        Node.string(block) === ""
}

function isNearbyBlockAVerseNumber(
    editor: Editor,
    direction: 'previous' | 'current' | 'next'
): boolean {
    const [block] = getNearbyBlock(editor, direction)
    return block && block.type == UsfmMarkers.CHAPTERS_AND_VERSES.v
}

function isNearbyBlockAVerseOrChapterNumberOrNull(
    editor: Editor,
    direction: 'previous' | 'current' | 'next'
): boolean {
    const [block] = getNearbyBlock(editor, direction)
    return !block ||
        UsfmMarkers.isVerseOrChapterNumber(block)
}

/**
 * Finds the parent block of the text node at the current selection's anchor point,
 * then returns the previous node
 */
function getPreviousBlock(editor: Editor): NodeEntry {
    return getNearbyBlock(editor, 'previous')
}

/**
 * Finds the parent block of the text node at the current selection's anchor point
 */
function getCurrentBlock(editor: Editor): NodeEntry {
    return getNearbyBlock(editor, 'current')
}

/**
 * Finds the parent block of the text node at the current selection's anchor point,
 * then returns the next node
 */
function getNextBlock(editor: Editor): NodeEntry {
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
    const [_, path] = Editor.node(editor, selection.anchor)
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
 * If no path is given, the verse above the current selection will be returned.
 */
function getVerseNode(editor: Editor, path?: Path): NodeEntry {
    const pathOption = path
        ? { at: path }
        : {}
    return Editor.above(
        editor,
        {
            match: (node) => node.type == NodeTypes.VERSE,
            ...pathOption
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
    includeFront = false
): NodeEntry {

    const [node] = Editor.node(editor, path)
    const thisVersePath: Path = node.type == NodeTypes.VERSE
        ? path
        : MyEditor.getVerseNode(editor, path)[1]
    
    const prevNode = Editor.node(editor, Path.previous(thisVersePath))
    const prevVerse = prevNode[0].type == NodeTypes.VERSE
        ? prevNode
        : undefined

    return prevVerse &&
        (includeFront || Node.string(prevVerse[0].children[0]) != "front")
        ? prevVerse
        : undefined
}

/**
 * Get the chapter corresponding to the given path.
 * The chapter node must be above the given path in the slate tree.
 * If no path is given, the chapter above the current selection will be returned.
 */
function getChapterNode(
    editor: Editor,
    path?: Path
): NodeEntry {
    const pathOption = path
        ? { at: path }
        : {}
    return Editor.above(
        editor,
        {
            match: (node) => node.type == NodeTypes.CHAPTER,
            ...pathOption
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
    const [chapter] = MyEditor.getChapterNode(editor, path)
    const children = Node.children(
        chapter,
        [],
        { reverse: true }
    )
    for (const child of children) {
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
    const [lastVerse] = MyEditor.getLastVerse(editor, path)
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
function identification(editor: Editor): IdentificationHeaders { 
    return parseIdentificationFromSlateTree(editor)
}

/**
 * Finds the path of a verse that matches the given chapter and
 * verse numbers. A value of "0" indicates "front".
 */
function findVersePath(
    editor: Editor,
    chapterNum: number,
    verseNum: number
): Path {
    if (chapterNum == 0) {
        console.warn("Book front matter navigation not implemented yet")
        return null
    }

    const verseStr = verseNum == 0
        ? "front"
        : verseNum.toString()

    const chapterNumMatch = (node: Node) => 
        Array.isArray(node.children) &&
        node.children.find(
            chapterNumNode =>
                chapterNumNode.type == UsfmMarkers.CHAPTERS_AND_VERSES.c &&
                Node.string(chapterNumNode) == chapterNum.toString()
        )
    const verseNumMatch = (node: Node) => 
        Array.isArray(node.children) &&
        node.children.find(
            verseNumNode => {
                if (verseNumNode.type != UsfmMarkers.CHAPTERS_AND_VERSES.v)
                    return false
                const thisVerseNumStr = Node.string(verseNumNode)
                if (thisVerseNumStr == verseStr)
                    return true
                const [thisStart, thisEndOrNull] = thisVerseNumStr.split("-")
                const thisEnd = thisEndOrNull ?? thisStart
                return verseNum >= parseInt(thisStart) && 
                    verseNum <= parseInt(thisEnd)
            }
        )
    const chapter = editor.children.find(chapterNumMatch)
    const chapterChildren = chapter && Array.isArray(chapter.children)
        ? chapter.children
        : null
    if (!chapterChildren) return null

    const verse = chapterChildren.find(verseNumMatch)
    if (!verse) return null

    const chapterIdx = editor.children.indexOf(chapter)
    const verseIdx = chapterChildren.indexOf(verse)

    return [chapterIdx, verseIdx]
}