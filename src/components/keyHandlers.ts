import { Range, Editor, Transforms, Path } from "slate"
import { NodeTypes } from "../utils/NodeTypes"
import { jsx } from "slate-hyperscript"

export function handleKeyPress(event, editor: Editor) {

    if (!isNavigationKey(event.key) &&
        isVerseOrChapterNumSelected(editor)
    ) {
        console.debug("Verse or chapter number selected, preventing action")
        event.preventDefault()
    }
}

export const withEnter = (editor: Editor) => {

    editor.insertBreak = (...args) => {
        const { selection } = editor
        const [parent, parentPath] = Editor.parent(editor, selection.anchor)
        if (selection && 
            Range.isCollapsed(selection) &&
            Editor.isStart(editor, selection.anchor, parentPath)
        ) {
            insertEmptyParagraph(editor, parentPath)
        } else {
            splitToInsertParagraph(editor, parentPath)
        }

    }
    return editor
}

export const withBackspace = (editor: Editor) => {
    const { deleteBackward } = editor

    editor.deleteBackward = (...args) => {
        const { selection } = editor
        const [parent, parentPath] = Editor.parent(editor, selection.anchor)

        if (selection && 
            Range.isCollapsed(selection) &&
            Editor.isStart(editor, selection.anchor, parentPath)
        ) {
            if (isPreviousNodeAVerseOrChapterNumberOrNull(editor, selection)) {
                console.debug("Invalid previous node, skipping backspace")
                return
            }
        }

        deleteBackward(...args)
    }

    return editor
}

export const withDelete = (editor: Editor) => {
    const { deleteForward } = editor

    editor.deleteForward = (...args) => {
        const { selection } = editor
        const [parent, parentPath] = Editor.parent(editor, selection.focus)

        if (selection && 
            Range.isCollapsed(selection) &&
            Editor.isEnd(editor, selection.focus, parentPath)
        ) {
            if (isNextNodeAVerseOrChapterNumberOrNull(editor, selection)) {
                console.debug("Invalid next node, skipping delete")
                return
            }
        }

        deleteForward(...args)
    }

    return editor
}

function insertEmptyParagraph(editor: Editor, path: Path) {
    Transforms.insertNodes(
        editor,
        jsx(
            'element', 
            {type: 'p'}, 
            [""]
        ),
        { at: path }
    )
}

/**
 * Splits the block container and changes the resulting block to a paragraph type
 */
function splitToInsertParagraph(editor: Editor, path: Path) {
    Transforms.splitNodes(editor, { always: true })
    Transforms.setNodes(
        editor, 
        { type: NodeTypes.P }, 
        { at: Path.next(path) }
    )
}

function isVerseOrChapterNumSelected(editor: Editor) {
    for (const [node, path] of Editor.nodes(editor, { at: editor.selection })) {
        if (node.type && NodeTypes.isVerseOrChapterNumberType(node.type)) {
            return true
        }
    }
    return false
}

function isNavigationKey(key) {
    const navigationKeys = [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown"
    ]
    return navigationKeys.includes(key)
}

function isPreviousNodeAVerseOrChapterNumberOrNull(editor, selection) {
    const [node, path] = Editor.node(editor, selection.anchor)
    const [parent, parentPath] = Editor.parent(editor, path)
    // Ensure that this node is the first child of its parent
    if (parent.children[0] == node) {
        const [prevNode, prevPath] = Editor.previous(editor, { at: parentPath }) || [null, null]
        return !prevNode ||
            prevNode.type == NodeTypes.VERSE_NUMBER ||
            prevNode.type == NodeTypes.CHAPTER_NUMBER
    } else {
        return false
    }
}

function isNextNodeAVerseOrChapterNumberOrNull(editor, selection) {
    const [node, path] = Editor.node(editor, selection.anchor)
    const [parent, parentPath] = Editor.parent(editor, path)
    // Ensure that this node is the last node of its parent
    if (parent.children[parent.children.length - 1] == node) {
        const [nextNode, nextPath] = Editor.next(editor, { at: parentPath }) || [null, null]
        return !nextNode ||
            nextNode.type == NodeTypes.VERSE_NUMBER ||
            nextNode.type == NodeTypes.CHAPTER_NUMBER
    } else {
        return false
    }
}