import { Transforms, Editor, Path } from "slate";
import { MyTransforms } from "./MyTransforms"
import { MyEditor } from "./MyEditor"
import { Node } from "slate";
import { range } from "lodash"
import { emptyVerseWithVerseNumber, textNode, verseNumber } from "../../transforms/basicSlateNodeFactory"
import NodeRules from "../../utils/NodeRules";

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
    const thisVerseNumPath = thisVersePath.concat(0)
    const prevVerseNumPath = prevVersePath.concat(0)

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
    MyTransforms.replaceNodes(
        editor,
        prevVerseNumPath,
        verseNumber(`${prevStart}-${thisEnd}`)
    )
    Transforms.mergeNodes(
        editor,
        { at: thisVersePath }
    )
    MyTransforms.moveToEndOfLastLeaf(
        editor,
        prevVersePath
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
    MyTransforms.moveToEndOfLastLeaf(
        editor,
        Path.previous(thisVersePath)
    )
}

function unjoinVerses(
    editor: Editor,
    path: Path
) {
    const [verse, versePath] = MyEditor.getVerse(editor, path)
    const verseNumPath = versePath.concat(0)
    const verseRange = Node.string(verse.children[0])
    const [thisStart, thisEnd] = verseRange.split("-")

    // Use replaceNodes() rather than replaceText() so that the
    // verse number is re-rendered, triggering effect hooks.
    MyTransforms.replaceNodes(
        editor,
        verseNumPath,
        verseNumber(thisStart),
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
    MyTransforms.moveToEndOfLastLeaf(
        editor,
        Path.next(versePath)
    )
}

function addVerse(
    editor: Editor,
    path: Path
) {
    const [verse, versePath] = MyEditor.getVerse(editor, path)
    const verseNumPath = versePath.concat(0)
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
    MyTransforms.moveToEndOfLastLeaf(
        editor,
        Path.next(versePath)
    )
    // Replace the original verse number with a clone of itself,
    // forcing the verse number to be re-rendered which will
    // trigger its effect hooks.
    MyTransforms.replaceNodes(
        editor,
        verseNumPath,
        verseNumber(verseNumberOrRange),
    )
}

/**
 * When a verse (verse N) is about to be joined to its preceding verse
 * (verse N-1), we check whether the inline container of verse N is 
 * 1) nonempty and 2) mergeable into the last node of verse N-1. 
 * If these two conditions are met, a space will be inserted at the
 * beginning of verse N's inline container.
 */
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
    if (NodeRules.canMergeAIntoB(
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