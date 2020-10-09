import { Transforms, Editor, Path, Range } from "slate";
import { ReactEditor } from 'slate-react'
import { DOMNode } from "slate-react/dist/utils/dom";
import { MyEditor } from "./MyEditor"

export const SelectionTransforms = {
    selectDOMNodeStart,
    selectNextSiblingNonEmptyText,
    moveToStartOfFirstLeaf,
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

function moveToStartOfFirstLeaf(
    editor: Editor,
    path: Path,
    options?: { edge: "focus" | "anchor" } | undefined
) {
    const [leaf, leafPath] = Editor.leaf(
        editor,
        path,
        { edge: "start" }
    )

    if (options?.edge) {
        Transforms.setPoint(
            editor,
            { path: leafPath, offset: 0 },
            { edge: options.edge }
        )
    } else {
        Transforms.select(
            editor,
            {
                path: leafPath,
                offset: 0
            }
        )
    }
}

function moveToEndOfLastLeaf(
    editor: Editor,
    path: Path,
    options?: { edge: "focus" | "anchor" } | undefined
) {
    const [lastLeaf, lastLeafPath] = Editor.leaf(
        editor,
        path,
        { edge: "end" }
    )
    if (options?.edge) {
        Transforms.setPoint(
            editor,
            { path: lastLeafPath, offset: lastLeaf.text.length },
            { edge: options.edge }
        )
    } else {
        Transforms.select(
            editor,
            {
                path: lastLeafPath,
                offset: lastLeaf.text.length
            }
        )
    }
}