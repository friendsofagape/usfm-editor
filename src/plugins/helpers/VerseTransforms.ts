import { Transforms, Editor, Path } from "slate";
import { MyTransforms } from "./MyTransforms"
import { MyEditor } from "./MyEditor"
import { Node } from "slate";
import { range } from "lodash"
import { emptyVerseWithVerseNumber, textNode } from "../../transforms/basicSlateNodeFactory"

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
    // second child is an inline container node
    const inlineContainerPath = thisVersePath.concat(1)
    // first child of a VerseNumber node is the text node.
    const prevVerseNumTextPath = prevVersePath.concat(0).concat(0)

    const thisNumOrRange = Node.string(thisVerse.children[0])
    const prevNumOrRange = Node.string(prevVerse.children[0])
    const [thisStart, thisEndOrNull] = thisNumOrRange.split("-")
    const thisEnd = thisEndOrNull ? thisEndOrNull : thisStart
    const [prevStart, prevEnd] = prevNumOrRange.split("-")

    const lastChildPathOfPreviousVerse = 
        prevVersePath.concat(prevVerse.children.length - 1)
    const [inlineContainer, _path] = Editor.node(editor, inlineContainerPath)
    const currentText = Node.string(inlineContainer)

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
    _addSpace(editor, currentText, lastChildPathOfPreviousVerse)
}

function removeVerseAndConcatenateContentsWithPrevious(
    editor: Editor,
    path: Path
) {
    const [thisVerse, thisVersePath] = MyEditor.getVerse(editor, path)
    const thisVerseNumPath = thisVersePath.concat(0)
    const inlineContainerPath = thisVersePath.concat(1)

    const [prevVerse, prevVersePath] = MyEditor.getPreviousVerse(editor, path)
    const lastChildPathOfPreviousVerse = 
        prevVersePath.concat(prevVerse.children.length - 1)
    const [inlineContainer, _path] = Editor.node(editor, inlineContainerPath)
    const currentText = Node.string(inlineContainer)

    Transforms.removeNodes(
        editor,
        { at: thisVerseNumPath }
    )
    Transforms.mergeNodes(
        editor,
        { at: thisVersePath }
    )
    _addSpace(editor, currentText, lastChildPathOfPreviousVerse)
}

function _addSpace(editor, searchString, path) {
    if (!searchString.trim()) {
        return
    }

    const [node, _path] = Editor.node(editor, path)
    const string = Node.string(node)

    const regex = new RegExp(`\\S+${searchString}$`)

    if (string.search(regex) > - 1) {
        const offsetInNode = string.length - searchString.length

        const cumulativeSum = (sum => value => sum += value)(0);
        const textLengths = node.children
            .map(child => child.text.length)
        const cumSum = textLengths
            .map(cumulativeSum)

        const textNodeIndex = cumSum.findIndex(n => n > offsetInNode)
        const offsetInText = textNodeIndex > 0
            ? offsetInNode - cumSum[textNodeIndex - 1]
            : offsetInNode
        
        const nodeText = node.children[textNodeIndex].text
        const withSpace = [nodeText.slice(0, offsetInText), " ", nodeText.slice(offsetInText)].join('')

        MyTransforms.replaceText(
            editor,
            path.concat(textNodeIndex),
            withSpace
        )
    }
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