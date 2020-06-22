import { Transforms, Editor, Path } from "slate";
import { MyTransforms } from "./MyTransforms"
import { MyEditor } from "./MyEditor"
import { Node } from "slate";
import { range } from "lodash"
import { emptyVerseWithVerseNumber, textNode } from "../../transforms/basicSlateNodeFactory"
import { NodeTypes } from "../../utils/NodeTypes";

export const VerseTransforms = {
    joinWithPreviousVerse,
    unjoinVerses,
    removeVerseAndConcatenateContentsWithPrevious,
    addVerse
}

function joinWithPreviousVerse(
    editor: Editor,
    path: Path
) {
    const [thisVerse, thisVersePath] = MyEditor.getVerse(editor, path)
    const [prevVerse, prevVersePath] = MyEditor.getPreviousVerse(editor, path)
    // first child is a VerseNumber node.
    const thisVerseNumPath = thisVersePath.concat(0)
    // first child of a VerseNumber node is the text node.
    const prevVerseNumTextPath = prevVersePath.concat(0).concat(0)

    const thisNumOrRange = Node.string(thisVerse.children[0])
    const prevNumOrRange = Node.string(prevVerse.children[0])
    const [thisStart, thisEndOrNull] = thisNumOrRange.split("-")
    const thisEnd = thisEndOrNull ? thisEndOrNull : thisStart
    const [prevStart, prevEnd] = prevNumOrRange.split("-")

    _insertLeadingSpaceIfNecessary(editor, thisVersePath)
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

function removeVerseAndConcatenateContentsWithPrevious(
    editor: Editor,
    path: Path
) {
    const [thisVerse, thisVersePath] = MyEditor.getVerse(editor, path)
    const thisVerseNumPath = thisVersePath.concat(0)

    _insertLeadingSpaceIfNecessary(editor, thisVersePath)
    Transforms.removeNodes(
        editor,
        { at: thisVerseNumPath }
    )
    Transforms.mergeNodes(
        editor,
        { at: thisVersePath }
    )
}

function unjoinVerses(
    editor: Editor,
    path: Path
) {
    const [verse, versePath] = MyEditor.getVerse(editor, path)
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

function addVerse(
    editor: Editor,
    path: Path
) {
    const [verse, versePath] = MyEditor.getVerse(editor, path)
    const verseNumberOrRange = Node.string(verse.children[0])
    const [rangeStart, rangeEnd] = verseNumberOrRange.split("-")
    const newVerseNum = rangeEnd
        ? parseInt(rangeEnd) + 1
        : parseInt(rangeStart) + 1

    const newVerse = emptyVerseWithVerseNumber(newVerseNum.toString())
    Transforms.insertNodes(
        editor,
        newVerse,
        { at: Path.next(versePath) }
    )
}

function _insertLeadingSpaceIfNecessary(editor: Editor, versePath: Path) {
    const inlineContainerPath = versePath.concat(1)
    const [inlineContainer, icPath] = Editor.node(editor, inlineContainerPath)
    const inlineContainerText = Node.string(inlineContainer)
    if (!inlineContainerText.trim()) {
        return
    }

    const [prevVerse, prevVersePath] = MyEditor.getPreviousVerse(editor, inlineContainerPath)
    const [lastChildOfPreviousVerse, lcPath] = 
        Editor.node(
            editor,
            prevVersePath.concat(prevVerse.children.length - 1)
        )
    if (NodeTypes.canMergeAIntoB(
        inlineContainer.type, 
        lastChildOfPreviousVerse.type
    )) {
        _insertLeadingSpace(editor, inlineContainerPath)
    }
}

function _insertLeadingSpace(
    editor: Editor,
    path: Path // Path of a node whose children are text nodes
) {
    const [node, _path] = Editor.node(editor, path)
    const currentText = Node.string(node)
    if (currentText.trim()) {
        Transforms.insertNodes(
            editor,
            textNode(" "),
            { at: path.concat(0) }
        )
    }
}