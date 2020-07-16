import { Transforms, Editor, Path, Range } from "slate";
import { ReactEditor } from 'slate-react'
import { DOMNode } from "slate-react/dist/utils/dom";
import { MyEditor } from "./MyEditor"

export const SelectionTransforms = {
    selectDOMNodeStart,
    selectNextSiblingNonEmptyText,
    moveToEndOfLastLeaf
}

/**
 * When the base deselect method is called, it sets the
 * selection to null and can prevent click listeners from
 * firing. A number of slate users have elected to disable
 * the deselect method. The side effect is that when the user
 * clicks outside of the editor, the selection will be
 * preserved even after onBlur() is called.
 */
Transforms.deselect = () => {
    console.debug("Deselect method is disabled")
    moveToEndOfLastLeaf
}

function selectDOMNodeStart(
    editor: ReactEditor,
    domNode: DOMNode
) {
    const path = MyEditor.getPathFromDOMNode(editor, domNode)
    Transforms.select(
        editor,
        {
            path: path,
            offset: 0
        }
    )
}

function selectNextSiblingNonEmptyText(editor: Editor) {
    if (!Range.isCollapsed(editor.selection)) {
        return
    }
    const [textNode, path] = Editor.node(editor, editor.selection)
    if (textNode.text == "") {
        const thisPath = editor.selection.anchor.path
        const [nextNode, nextPath] = Editor.next(editor) || [null, null]
        if (nextPath && 
            Path.equals(
                Path.parent(thisPath), 
                Path.parent(nextPath)
            )
        ) {
            Transforms.select(
                editor, 
                {
                    path: nextPath,
                    offset: 0
                }
            )
        }
    }
}

function moveToEndOfLastLeaf(
    editor: Editor,
    path: Path
) {
    const [lastLeaf, lastLeafPath] = Editor.leaf(
        editor,
        path,
        { edge: "end" }
    )
    Transforms.select(
        editor,
        {
            path: lastLeafPath,
            offset: lastLeaf.text.length
        }
    )
}