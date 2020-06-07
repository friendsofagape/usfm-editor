import { Transforms, Editor, Path } from "slate";
import { NodeTypes } from "../../utils/NodeTypes";
import { VerseTransforms } from "./VerseTransforms"
import { ReactEditor } from 'slate-react'
import { DOMNode } from "slate-react/dist/utils/dom";

export const MyTransforms = {
    ...Transforms,
    ...VerseTransforms,
    mergeSelectedBlockAndSetToInlineContainer,
    replaceText,
    selectDOMNodeStart,
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

function replaceText(
    editor: Editor,
    path: Path,
    newText: string
) {
    Transforms.delete(
        editor,
        { at: path }
    )
    Transforms.insertText(
        editor,
        newText,
        { at: path }
    )
}

function selectDOMNodeStart(
    editor: ReactEditor,
    domNode: DOMNode
) {
    const slateNode = ReactEditor.toSlateNode(editor, domNode)
    const path = ReactEditor.findPath(editor, slateNode)
    Transforms.select(
        editor,
        {
            path: path,
            offset: 0
        }
    )
}