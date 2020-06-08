import { Transforms, Editor, Path } from "slate";
import { NodeTypes } from "../../utils/NodeTypes";
import { MyEditor } from "./MyEditor"
import { Node } from "slate";
import { range } from "lodash"
import { emptyVerseWithVerseNumber } from "../../transforms/basicSlateNodeFactory"
import { ReactEditor } from 'slate-react'
import { DOMNode } from "slate-react/dist/utils/dom";

export const MyTransforms = {
    ...Transforms,
    mergeSelectedBlockAndSetToInlineContainer,
    replaceText,
    joinWithPreviousVerse,
    unjoinVerses,
    selectDOMNodeStart
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

function joinWithPreviousVerse(editor: Editor) {
    const [thisVerse, thisVersePath] = MyEditor.getVerse(editor)
    const [prevVerse, prevVersePath] = MyEditor.getPreviousVerse(editor)
    // first child is a VerseNumber node.
    const thisVerseNumPath = thisVersePath.concat(0)
    // first child of a VerseNumber node is the text node.
    const prevVerseNumTextPath = prevVersePath.concat(0).concat(0)

    const thisNumOrRange = Node.string(thisVerse.children[0])
    const prevNumOrRange = Node.string(prevVerse.children[0])
    const [thisStart, thisEndOrNull] = thisNumOrRange.split("-")
    const thisEnd = thisEndOrNull ? thisEndOrNull : thisStart
    const [prevStart, prevEnd] = prevNumOrRange.split("-")

    Transforms.removeNodes(
        editor,
        { at: thisVerseNumPath }
    )
    MyTransforms.replaceText(
        editor,
        prevVerseNumTextPath,
        `${prevStart}-${thisEnd}`,
    )
    Transforms.mergeNodes(
        editor,
        { at: thisVersePath }
    )
}

function unjoinVerses(editor: Editor) {
    const [verse, versePath] = MyEditor.getVerse(editor)
    const verseNumTextPath = versePath.concat(0).concat(0)

    const verseRange = Node.string(verse.children[0])
    const [thisStart, thisEnd] = verseRange.split("-")

    MyTransforms.replaceText(
        editor,
        verseNumTextPath,
        thisStart
    )

    const newVerses = range(
        parseInt(thisStart) + 1,
        parseInt(thisEnd) + 1, 
        1
    ).map(
        num => emptyVerseWithVerseNumber(num.toString())
    )
    Transforms.insertNodes(
        editor,
        newVerses,
        { at: Path.next(versePath) }
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