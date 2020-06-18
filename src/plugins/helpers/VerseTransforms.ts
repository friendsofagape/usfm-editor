import { Transforms, Editor, Path } from "slate";
import { MyTransforms } from "./MyTransforms"
import { MyEditor } from "./MyEditor"
import { ReactEditor } from 'slate-react'
import { Node } from "slate";
import { range } from "lodash"
import { emptyVerseWithVerseNumber } from "../../transforms/basicSlateNodeFactory"

export const VerseTransforms = {
    joinWithPreviousVerse,
    unjoinVerses,
    removeVerseAndConcatenateContentsWithPrevious,
    addVerse
}

function joinWithPreviousVerse(editor: ReactEditor, verseNumberRef) {
    const slateNode = ReactEditor.toSlateNode(editor, verseNumberRef)
    const path = ReactEditor.findPath(editor, slateNode)

    let thisVerse, thisVersePath = null
    try {
        [thisVerse, thisVersePath] = MyEditor.getVerse(editor, path)
    } catch(e) {
        console.log("**********ERROR: selection is ", editor.selection)
        console.log("   path: ", path)
    }
    console.log("Success: selection is ", editor.selection)
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

function removeVerseAndConcatenateContentsWithPrevious(editor: ReactEditor, verseNumberRef) {
    const slateNode = ReactEditor.toSlateNode(editor, verseNumberRef)
    const path = ReactEditor.findPath(editor, slateNode)

    const [thisVerse, thisVersePath] = MyEditor.getVerse(editor, path)
    const thisVerseNumPath = thisVersePath.concat(0)

    Transforms.removeNodes(
        editor,
        { at: thisVerseNumPath }
    )
    Transforms.mergeNodes(
        editor,
        { at: thisVersePath }
    )
}

function unjoinVerses(editor: ReactEditor, verseNumberRef) {
    const slateNode = ReactEditor.toSlateNode(editor, verseNumberRef)
    const path = ReactEditor.findPath(editor, slateNode)

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

function addVerse(editor: ReactEditor, verseNumberRef) {
    const slateNode = ReactEditor.toSlateNode(editor, verseNumberRef)
    const path = ReactEditor.findPath(editor, slateNode)

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