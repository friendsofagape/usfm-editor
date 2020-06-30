import { Transforms, Editor, Path, Range } from "slate";
import { NodeTypes } from "../../utils/NodeTypes";
import { VerseTransforms } from "./VerseTransforms"
import { ReactEditor } from 'slate-react'
import { DOMNode } from "slate-react/dist/utils/dom";
import { MyEditor } from "./MyEditor"
import { textNode } from "../../transforms/basicSlateNodeFactory";
import { transformToSlate } from '../../transforms/usfmToSlate';
import { UsfmMarkers } from "../../utils/UsfmMarkers";

export const MyTransforms = {
    ...Transforms,
    ...VerseTransforms,
    mergeSelectedBlockAndSetToInlineContainer,
    replaceText,
    selectDOMNodeStart,
    selectNextSiblingNonEmptyText,
    moveToEndOfLastLeaf,
    updateIdentificationHeaders,
    fixCollapsedSelectionOnNonTextNode
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

/**
 * Updates the identification headers, stored in the "headers" node of
 * the editor's children (at path [0].)
 * 
 * @param {Object} idJson - Json specifying the identification headers
 *      example: {'toc1': 'The Book of Genesis', 'id': 'GEN'}
 */
function updateIdentificationHeaders(editor: Editor, idJson: Object) {

    const newIdHeaders = _transformJsonToSlateIdentificationHeaders(idJson)

    Transforms.removeNodes(
        editor,
        {
            at: [0], // look at headers only, not chapter contents
            voids: true, // captures nodes that aren't represented in the DOM
            match: node =>
                node.type &&
                UsfmMarkers.isIdentification(node.type)
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

/**
 * The editor's collapsed selection should never be on a non-text node.
 * Fixes this scenario by selecting the first text node in the document.
 */
function fixCollapsedSelectionOnNonTextNode(editor: Editor) {
    if (editor.selection && 
        Range.isCollapsed(editor.selection) &&
        !Editor.node(editor, editor.selection)[0].hasOwnProperty("text")
    ) {
        Transforms.select(editor, Editor.start(editor, []))
    }
}

function _transformJsonToSlateIdentificationHeaders(idJson: Object) {
    const newIdHeadersAsArray = Object.entries(idJson)
        .map(entry => {
            const marker = entry[0]
            if (!UsfmMarkers.isIdentification(marker)) {
                console.warn("Encountered non-identification header: ",
                    JSON.stringify(entry))
                return null
            }
            return {
                "tag": entry[0],
                "content": entry[1]
            }
        })
        .filter(h => h) // filter out nulls

    return newIdHeadersAsArray.map(transformToSlate)
}