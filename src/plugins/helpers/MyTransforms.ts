import { Transforms, Editor, Path, Range, Node, Element, Text } from "slate";
import { NodeTypes } from "../../utils/NodeTypes";
import { VerseTransforms } from "./VerseTransforms"
import { ReactEditor } from 'slate-react'
import { DOMNode } from "slate-react/dist/utils/dom";
import { MyEditor } from "./MyEditor"
import { textNode } from "../../transforms/basicSlateNodeFactory";

export const MyTransforms = {
    ...Transforms,
    ...VerseTransforms,
    mergeSelectedBlockAndSetToInlineContainer,
    replaceNodes,
    replaceText,
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
}

/**
 * Merges the selected block with the next or previous block,
 * then sets the resulting block to an inline container type.
 */
function mergeSelectedBlockAndSetToInlineContainer(
    editor: Editor,
    options: {
        mode?: 'next' | 'previous'
    }
) {
    const { mode = 'previous' } = options

    const [selectedBlock, selectedBlockPath] = Editor.parent(editor, editor.selection.anchor.path)
    const mergePath = mode === 'previous'
        ? selectedBlockPath
        : Path.next(selectedBlockPath)

    // The path of the newly merged node
    const resultingPath = mode === 'previous'
        ? Path.previous(selectedBlockPath)
        : selectedBlockPath

    Editor.withoutNormalizing(editor, () => {
        Transforms.mergeNodes(editor, { at: mergePath })
        Transforms.setNodes(editor,
            { type: NodeTypes.INLINE_CONTAINER },
            { at: resultingPath }
        )
    })
}

/**
 * Replaces the nodes at the given path with the desired nodes.
 * Uses Editor.withoutNormalizing. 
 * 
 * @param editor Slate editor
 * @param path Slate path of nodes to replace
 * @param nodes The node or nodes that will replace the nodes at "path".
 * The type of "nodes" matches the type required by Slate's 
 * Transforms.insertNodes.
 */
function replaceNodes(
    editor: Editor,
    path: Path,
    nodes: Editor | Element | Text | Node[]
) {
    Editor.withoutNormalizing(editor, () => {
        Transforms.removeNodes(
            editor,
            { at: path }
        )
        Transforms.insertNodes(
            editor,
            nodes,
            { at: path }
        )
    })
}

function replaceText(
    editor: Editor,
    path: Path,
    newText: string
) {
    Transforms.delete(
        editor,
        { at: path }
    )
    Transforms.insertNodes(
        editor,
        textNode(newText),
        { at: path }
    )
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