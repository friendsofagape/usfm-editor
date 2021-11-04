import { Editor, Path, Node, NodeEntry, Element } from "slate"
import NodeTypes from "../../utils/NodeTypes"
import { ReactEditor } from "slate-react"
import { DOMNode } from "slate-react/dist/utils/dom"
import { parseIdentificationFromSlateTree } from "../../transforms/identificationTransforms"
import { UsfmMarkers } from "../../utils/UsfmMarkers"
import { IdentificationHeaders } from "../../UsfmEditor"

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
    findVersePath,
}

function isMatchingNodeSelected(
    editor: Editor,
    matchFcn: ((node: Node) => boolean) | ((node: Node) => node is Node)
): boolean {
    const [match] = Editor.nodes(editor, {
        match: matchFcn,
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
    direction: "previous" | "current" | "next"
): boolean {
    const block = getNearbyBlock(editor, direction)?.[0]
    return block?.type == NodeTypes.INLINE_CONTAINER
}

function isNearbyBlockAnEmptyInlineContainer(
    editor: Editor,
    direction: "previous" | "current" | "next"
): boolean {
    const block = getNearbyBlock(editor, direction)?.[0]
    return (
        block !== undefined &&
        block.type == NodeTypes.INLINE_CONTAINER &&
        Node.string(block) === ""
    )
}

function isNearbyBlockAVerseNumber(
    editor: Editor,
    direction: "previous" | "current" | "next"
): boolean {
    const block = getNearbyBlock(editor, direction)?.[0]
    return block?.type == UsfmMarkers.CHAPTERS_AND_VERSES.v
}

function isNearbyBlockAVerseOrChapterNumberOrNull(
    editor: Editor,
    direction: "previous" | "current" | "next"
): boolean {
    const block = getNearbyBlock(editor, direction)?.[0]
    return !block || UsfmMarkers.isVerseOrChapterNumber(block)
}

/**
 * Finds the parent block of the text node at the current selection's anchor point,
 * then returns the previous node
 */
function getPreviousBlock(editor: Editor): NodeEntry | undefined {
    return getNearbyBlock(editor, "previous")
}

/**
 * Finds the parent block of the text node at the current selection's anchor point
 */
function getCurrentBlock(editor: Editor): NodeEntry | undefined {
    return getNearbyBlock(editor, "current")
}

/**
 * Finds the parent block of the text node at the current selection's anchor point,
 * then returns the next node
 */
function getNextBlock(editor: Editor): NodeEntry | undefined {
    return getNearbyBlock(editor, "next")
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
    direction: "previous" | "current" | "next" = "current"
): NodeEntry<Element> | undefined {
    const point = editor.selection?.anchor
    if (!point) return undefined
    const [_, path] = Editor.node(editor, point)
    const [parent, parentPath] = Editor.parent(editor, path)
    if (!Element.isElement(parent)) return undefined

    switch (direction) {
        case "current":
            return [parent, parentPath]
        case "previous":
            return Editor.previous(editor, { at: parentPath })
        case "next":
            return Editor.next(editor, { at: parentPath })
    }
}

/**
 * Get the verse corresponding to the given path.
 * The verse node must be above the given path in the slate tree.
 * If no path is given, the verse above the current selection will be returned.
 */
function getVerseNode(
    editor: Editor,
    path?: Path
): NodeEntry<Element> | undefined {
    const pathOption = path ? { at: path } : {}
    return Editor.above(editor, { match: isVerseNode, ...pathOption })
}

/**
 * Get the previous verse node (before the given path),
 * optionally including the "front" verse (default is false)
 */
function getPreviousVerse(
    editor: Editor,
    path: Path,
    includeFront = false
): NodeEntry<Element> | undefined {
    const [node] = Editor.node(editor, path)
    const thisVersePath: Path | undefined =
        isVerseNode(node)
            ? path
            : MyEditor.getVerseNode(editor, path)?.[1]

    const prevNode = thisVersePath
        ? Editor.node(editor, Path.previous(thisVersePath))
        : undefined
    if (!prevNode || !prevNode[0]) return undefined
    const [prevVerseElement, prevVersePath] = prevNode
    if (!isVerseNode(prevVerseElement)) return undefined
    if (!Element.isElement(prevVerseElement)) return undefined
    return includeFront || Node.string(prevVerseElement.children[0]) !== "front"
        ? [prevVerseElement, prevVersePath]
        : undefined
}

/**
 * Get the chapter corresponding to the given path.
 * The chapter node must be above the given path in the slate tree.
 * If no path is given, the chapter above the current selection will be returned.
 */
function getChapterNode(editor: Editor, path?: Path): NodeEntry | undefined {
    const pathOption = path ? { at: path } : {}
    return Editor.above(editor, { match: isChapterNode, ...pathOption })
}

/**
 * Get the last verse of the chapter above the given path.
 */
function getLastVerse(editor: Editor, path: Path): NodeEntry | undefined {
    const chapter = MyEditor.getChapterNode(editor, path)?.[0]
    if (!chapter) return undefined
    const children = Node.children(chapter, [], { reverse: true })
    for (const child of children) {
        if (isVerseNode(child[0])) {
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
): string | undefined {
    const lastVerse = MyEditor.getLastVerse(editor, path)?.[0]
    return Element.isElement(lastVerse)
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
): Path | undefined {
    if (chapterNum == 0) {
        console.warn("Book front matter navigation not implemented yet")
        return undefined
    }

    const verseStr = verseNum == 0 ? "front" : verseNum.toString()

    const chapterNumMatch = (node: Node): boolean =>
        Element.isAncestor(node) &&
        node.children.some((chapterNumNode) =>
            Element.isElement(chapterNumNode) &&
            chapterNumNode.type == UsfmMarkers.CHAPTERS_AND_VERSES.c &&
            Node.string(chapterNumNode) == chapterNum.toString()
        )

    const verseNumMatch = (node: Node): boolean =>
        Element.isAncestor(node) &&
        node.children.some((verseNumNode) => {
            if (!Element.isElement(verseNumNode) || verseNumNode.type != UsfmMarkers.CHAPTERS_AND_VERSES.v)
                return false
            const thisVerseNumStr = Node.string(verseNumNode)
            if (thisVerseNumStr == verseStr) return true
            const [thisStart, thisEndOrNull] = thisVerseNumStr.split("-")
            const thisEnd = thisEndOrNull ?? thisStart
            return (
                verseNum >= parseInt(thisStart) && verseNum <= parseInt(thisEnd)
            )
        })

    const chapter = editor.children.find(chapterNumMatch)
    if (!Element.isElement(chapter)) return undefined
    const chapterChildren = chapter.children

    const verse = chapterChildren.find(verseNumMatch)
    if (!verse) return undefined

    const chapterIdx = editor.children.indexOf(chapter)
    const verseIdx = chapterChildren.indexOf(verse)

    return [chapterIdx, verseIdx]
}

function isChapterNode(node: Node): boolean {
    return Element.isElement(node) && node.type == NodeTypes.CHAPTER
}

function isVerseNode(node: Node): boolean {
    return Element.isElement(node) && node.type == NodeTypes.VERSE
}
