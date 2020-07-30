import { Transforms, Editor, Path, Node, Element, Text } from "slate";
import NodeTypes from "../../utils/NodeTypes";
import { VerseTransforms } from "./VerseTransforms"
import { textNode } from "../../transforms/basicSlateNodeFactory";
import { UsfmMarkers } from "../../utils/UsfmMarkers";
import { SelectionTransforms } from "./SelectionTransforms";
import { identificationToSlate } from "../../transforms/identificationTransforms";

export const MyTransforms = {
    ...Transforms,
    ...VerseTransforms,
    ...SelectionTransforms,
    mergeSelectedBlockAndSetToInlineContainer,
    replaceNodes,
    replaceText,
    setIdentification
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

/**
 * Sets the identification headers, stored in the "headers" node of
 * the editor's children (at path [0].)
 * 
 * @param {Editor} editor
 * @param {Object} identification - Json specifying the identification headers
 */
function setIdentification(
    editor: Editor, 
    identification: Object, 
) {
    const slateHeaders = identificationToSlate(identification)

    const sortedHeaders = slateHeaders.sort((a, b) => 
        UsfmMarkers.compare(a.type, b.type)
    )

    Editor.withoutNormalizing(editor, () => {
        // Replace the existing identification headers
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
            sortedHeaders,
            { at: [0, 0] }
        )
    })
}