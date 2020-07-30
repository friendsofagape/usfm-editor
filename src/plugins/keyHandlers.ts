import { Range, Editor, Transforms, Path } from "slate"
import { MyEditor } from "./helpers/MyEditor"
import { MyTransforms } from "./helpers/MyTransforms"
import { UsfmMarkers }from "../utils/UsfmMarkers"

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
        splitToInsertParagraph(editor)
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
            if (MyEditor.isNearbyBlockAVerseOrChapterNumberOrNull(editor, 'previous')) {
                console.debug("Invalid previous node, skipping backspace")
                return
            } else if (MyEditor.isNearbyBlockAnInlineContainer(editor, 'previous')) {
                MyTransforms.mergeSelectedBlockAndSetToInlineContainer(
                    editor,
                    { mode: 'previous' }
                )
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
            if (MyEditor.isNearbyBlockAVerseOrChapterNumberOrNull(editor, 'next')) {
                console.debug("Invalid next node, skipping delete")
                return
            } else if (MyEditor.isNearbyBlockAnEmptyInlineContainer(editor, 'current')) {
                MyTransforms.mergeSelectedBlockAndSetToInlineContainer(
                    editor,
                    { mode: 'next' }
                )
                return
            }
        }
        deleteForward(...args)
    }
    return editor
}

/**
 * Splits the block container and changes the resulting block to a paragraph type
 */
function splitToInsertParagraph(editor: Editor) {
    // If there is an empty text selected, we need to move the selecton forward,
    // or else the selection will stay on the previous line
    MyTransforms.selectNextSiblingNonEmptyText(editor)
    const [parent, parentPath] = Editor.parent(editor, editor.selection.anchor)
    // After splitting a node, the resulting nodes may be combined via normalization, 
    // so run these together without normalizing
    Editor.withoutNormalizing(editor, () => {
        Transforms.splitNodes(editor, { always: true })
        Transforms.setNodes(
            editor,
            { type: UsfmMarkers.PARAGRAPHS.p },
            { at: Path.next(parentPath) }
        )
    })
}

function isVerseOrChapterNumSelected(editor: Editor) {
    for (const [node, path] of Editor.nodes(editor, { at: editor.selection })) {
        if (node.type && UsfmMarkers.isVerseOrChapterNumber(node.type)) {
            return true
        }
    }
    return false
}

const navigationKeys = [
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown"
]

function isNavigationKey(key) {
    return navigationKeys.includes(key)
}