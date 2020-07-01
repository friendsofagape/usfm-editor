import { Transforms, Editor, Path } from "slate";
import { NodeTypes } from "../../utils/NodeTypes";
import { VerseTransforms } from "./VerseTransforms"
import { textNode } from "../../transforms/basicSlateNodeFactory";
import { transformToSlate } from '../../transforms/usfmToSlate';
import { UsfmMarkers } from "../../utils/UsfmMarkers";
import { SelectionTransforms } from "./SelectionTransforms";

export const MyTransforms = {
    ...Transforms,
    ...VerseTransforms,
    ...SelectionTransforms,
    mergeSelectedBlockAndSetToInlineContainer,
    replaceText,
    updateIdentificationHeaders
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
    Transforms.insertNodes(
        editor,
        textNode(newText),
        { at: path }
    )
}

/**
 * Updates the identification headers, stored in the "headers" node of
 * the editor's children (at path [0].)
 * 
 * @param {Object} idJson - Json specifying the identification headers
 *      example: {'toc1': 'The Book of Genesis', 'id': 'GEN'}
 */
function updateIdentificationHeaders(editor: Editor, idJson: Object) {

    const newIdHeaders = Object.entries(idJson)
        .map(entry => (
            {
                "tag": entry[0],
                "content": entry[1]
            }
        ))
        .map(transformToSlate)

    Transforms.removeNodes(
        editor,
        {
            at: [0], // look at headers only, not chapter contents
            voids: true, // captures nodes that aren't represented in the DOM
            match: node => UsfmMarkers.isIdentification(node.type)
        }
    )
    Transforms.insertNodes(
        editor,
        // @ts-ignore
        newIdHeaders,
        {
            at: [0, 0]
        }
    )
}