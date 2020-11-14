import { Range, Editor, Transforms, Path, Node } from "slate"
import { MyEditor } from "./helpers/MyEditor"
import { MyTransforms } from "./helpers/MyTransforms"
import { UsfmMarkers } from "../utils/UsfmMarkers"
import { ReactEditor } from "slate-react"
import { SelectionTransforms } from "./helpers/SelectionTransforms"

export function handleKeyPress(
    event: React.KeyboardEvent,
    editor: Editor
): void {
    if (event.key == "ArrowLeft") {
        onLeftArrowPress(event, editor)
    } else if (event.key == "ArrowRight") {
        onRightArrowPress(event, editor)
    }

    if (!isNavigationKey(event.key) && isVerseOrChapterNumSelected(editor)) {
        console.debug("Verse or chapter number selected, preventing action")
        event.preventDefault()
    }
}

export const withEnter = (editor: ReactEditor): ReactEditor => {
    editor.insertBreak = () => {
        splitToInsertParagraph(editor)
    }
    return editor
}

export const withBackspace = (editor: ReactEditor): ReactEditor => {
    const { deleteBackward } = editor

    editor.deleteBackward = (...args) => {
        const { selection } = editor
        const [_, parentPath] = Editor.parent(editor, selection.anchor)

        if (
            selection &&
            Range.isCollapsed(selection) &&
            Editor.isStart(editor, selection.anchor, parentPath)
        ) {
            if (
                MyEditor.isNearbyBlockAVerseOrChapterNumberOrNull(
                    editor,
                    "previous"
                )
            ) {
                console.debug("Invalid previous node, skipping backspace")
                return
            } else if (
                MyEditor.isNearbyBlockAnInlineContainer(editor, "previous")
            ) {
                MyTransforms.mergeSelectedBlockAndSetToInlineContainer(editor, {
                    mode: "previous",
                })
                return
            }
        }
        deleteBackward(...args)
    }
    return editor
}

export const withDelete = (editor: ReactEditor): ReactEditor => {
    const { deleteForward } = editor

    editor.deleteForward = (...args) => {
        const { selection } = editor
        const [_, parentPath] = Editor.parent(editor, selection.focus)

        if (
            selection &&
            Range.isCollapsed(selection) &&
            Editor.isEnd(editor, selection.focus, parentPath)
        ) {
            if (
                MyEditor.isNearbyBlockAVerseOrChapterNumberOrNull(
                    editor,
                    "next"
                )
            ) {
                console.debug("Invalid next node, skipping delete")
                return
            } else if (
                MyEditor.isNearbyBlockAnEmptyInlineContainer(editor, "current")
            ) {
                MyTransforms.mergeSelectedBlockAndSetToInlineContainer(editor, {
                    mode: "next",
                })
                return
            }
        }
        deleteForward(...args)
    }
    return editor
}

function onLeftArrowPress(event, editor: Editor) {
    const [_block, blockPath] = MyEditor.getCurrentBlock(editor)
    const [prevBlock, _prevBlockPath] = MyEditor.getPreviousBlock(editor)

    // Move left through a verse number node to the end of the previous verse,
    // but do not attempt to move left through a "front" verse node.
    if (
        MyEditor.isNearbyBlockAVerseNumber(editor, "previous") &&
        Range.isCollapsed(editor.selection) &&
        Editor.isStart(editor, editor.selection.anchor, blockPath)
    ) {
        event.preventDefault()

        if (Node.string(prevBlock) == "front") return

        const prevVerseEntry = MyEditor.getPreviousVerse(
            editor,
            editor.selection.focus.path,
            true
        )
        if (prevVerseEntry) {
            SelectionTransforms.moveToEndOfLastLeaf(editor, prevVerseEntry[1])
        } else {
            console.debug(
                "Previous node is a non-front verse number, but no prior verse exists"
            )
        }
    }
}

function onRightArrowPress(event, editor: Editor) {
    const chapterNodeEntry = MyEditor.getChapterNode(editor)
    if (
        Range.isCollapsed(editor.selection) &&
        Editor.isEnd(editor, editor.selection.anchor, chapterNodeEntry[1])
    ) {
        event.preventDefault()
    }
}

/**
 * Splits the block container and changes the resulting block to a paragraph type
 */
function splitToInsertParagraph(editor: Editor) {
    // If there is an empty text selected, we need to move the selecton forward,
    // or else the selection will stay on the previous line
    MyTransforms.selectNextSiblingNonEmptyText(editor)
    const [_, parentPath] = Editor.parent(editor, editor.selection.anchor)
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
    for (const [node] of Editor.nodes(editor, { at: editor.selection })) {
        if (UsfmMarkers.isVerseOrChapterNumber(node)) {
            return true
        }
    }
    return false
}

const navigationKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]

function isNavigationKey(key) {
    return navigationKeys.includes(key)
}
