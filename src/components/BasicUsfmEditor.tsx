import * as React from "react"
import { withReact, Slate, Editable, ReactEditor } from "slate-react"
import { createEditor, Transforms, Editor, Node, Range, Element } from "slate"
import {
    renderElementByType,
    renderLeafByProps,
} from "../transforms/usfmRenderer"
import { usfmToSlate } from "../transforms/usfmToSlate"
import { withNormalize } from "../plugins/normalizeNode"
import {
    handleKeyPress,
    withBackspace,
    withDelete,
    withEnter,
} from "../plugins/keyHandlers"
import { slateToUsfm } from "../transforms/slateToUsfm"
import { debounce, flowRight, isEqual } from "lodash"
import { MyTransforms } from "../plugins/helpers/MyTransforms"
import { SelectionTransforms } from "../plugins/helpers/SelectionTransforms"
import {
    parseIdentificationFromUsfm,
    filterInvalidIdentification,
    mergeIdentification,
    normalizeIdentificationValues,
} from "../transforms/identificationTransforms"
import { MyEditor } from "../plugins/helpers/MyEditor"
import "./default.css"
import {
    UsfmEditorRef,
    UsfmEditorProps,
    ForwardRefUsfmEditor,
    usfmEditorPropTypes,
    usfmEditorDefaultProps,
    Verse,
    IdentificationHeaders,
} from "../UsfmEditor"
import NodeRules from "../utils/NodeRules"
import { UsfmMarkers } from "../utils/UsfmMarkers"
import { HoveringToolbar } from "./HoveringToolbar"
import { isTypedNode } from "../utils/TypedNode"

export const createBasicUsfmEditor = (): ForwardRefUsfmEditor<
    BasicUsfmEditor
> => {
    const e = React.forwardRef<BasicUsfmEditor, UsfmEditorProps>(
        ({ ...props }, ref) => <BasicUsfmEditor {...props} ref={ref} />
    )
    e.displayName = "BasicUsfmEditor"
    return e
}

/**
 * A WYSIWYG editor component for USFM
 */
export class BasicUsfmEditor
    extends React.Component<UsfmEditorProps, BasicUsfmEditorState>
    implements UsfmEditorRef {
    public static propTypes = usfmEditorPropTypes
    public static defaultProps = usfmEditorDefaultProps

    slateEditor: ReactEditor

    constructor(props: UsfmEditorProps) {
        super(props)
        this.state = {
            value: usfmToSlate(props.usfmString),
            selectedVerse: undefined,
            prevUsfmStringProp: props.usfmString,
        }

        this.slateEditor = flowRight(
            withBackspace,
            withDelete,
            withEnter,
            withNormalize,
            withReact,
            createEditor
        )()
        this.slateEditor.isInline = () => false
    }

    // Since usfmString and goToVerse can be updated at the same time, we need to calculate the new
    // value before the editor renders. Once it renders, we can proceed.
    static getDerivedStateFromProps(
        props: UsfmEditorProps,
        state: BasicUsfmEditorState
    ): BasicUsfmEditorState | null {
        if (state.prevUsfmStringProp == props.usfmString) return null
        return {
            value: usfmToSlate(props.usfmString),
            prevUsfmStringProp: props.usfmString,
        }
    }

    /* UsfmEditor interface functions */

    getMarksAtCursor = (): string[] => {
        if (!this.slateEditor.selection) return []
        const record = Editor.marks(this.slateEditor)
        if (!record) return []
        const markArray = Object.keys(record).filter(
            (k: string) => record[k] === true
        )
        return markArray
    }

    addMarkAtCursor = (mark: string): void => {
        if (!this.slateEditor.selection) return
        Editor.addMark(this.slateEditor, mark, true)
    }

    removeMarkAtCursor = (mark: string): void => {
        if (!this.slateEditor.selection) return
        Editor.removeMark(this.slateEditor, mark)
    }

    getParagraphTypesAtCursor = (): string[] => {
        if (!this.slateEditor.selection) return []
        let types: string[] = []
        for (const entry of Editor.nodes(this.slateEditor)) {
            const node = entry[0]
            if (isTypedNode(node) && UsfmMarkers.isParagraphType(node)) {
                types = types.concat(node.type)
            }
        }
        return types
    }

    setParagraphTypeAtCursor = (marker: string): void => {
        if (!this.slateEditor.selection) return
        Transforms.setNodes(
            this.slateEditor,
            { type: marker },
            { match: NodeRules.isFormattableBlockType }
        )
    }

    goToVerse = (verseObject?: Verse): void => {
        if (!verseObject) return
        const { chapter, verse } = verseObject

        const versePath = MyEditor.findVersePath(
            this.slateEditor,
            chapter,
            verse
        )
        if (!versePath) return

        const [verseNode] = Editor.node(this.slateEditor, versePath)
        if (!Element.isElement(verseNode)) return

        const verseNumOrRange = Node.string(verseNode.children[0])

        const inlineContainerPath = versePath.concat(1)
        SelectionTransforms.moveToStartOfFirstLeaf(
            this.slateEditor,
            inlineContainerPath
        )
        ReactEditor.focus(this.slateEditor)

        if (
            !this.props.onVerseChange ||
            !this.didSelectedVerseChange(chapter, verseNumOrRange)
        ) {
            return
        }

        this.updateSelectedVerse(chapter, verseNumOrRange)
    }

    /* BasicUsfmEditor functions */

    handleChange: (value: Node[]) => void = (value) => {
        console.debug("after change", value)
        this.fixSelectionOnChapterOrVerseNumber()
        this.setState({ value: value })
        this.scheduleOnChange(value)
    }

    scheduleOnChange = debounce((newValue: Node[]) => {
        if (this.props.onChange) {
            const usfm = slateToUsfm(newValue)
            this.props.onChange(usfm)
        }
        if (this.props.onVerseChange) {
            // No need to keep track of selected chapter and verse if
            // onVerseChange is not given.
            this.updateSelectedVerseAfterEditorChange()
        }
    }, 200)

    onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
        handleKeyPress(event, this.slateEditor)
    }

    fixSelectionOnChapterOrVerseNumber(): void {
        const editor = this.slateEditor
        const selection = editor.selection
        if (!selection || !MyEditor.isVerseOrChapterNumberSelected(editor)) {
            return
        }

        console.debug("selection before correction: ", selection)

        const anchorVersePath = MyEditor.getVerseNode(
            editor,
            selection.anchor.path
        )?.[1]

        if (Range.isCollapsed(selection) && anchorVersePath) {
            // This can happen when nodes get merged after the user presses delete at the
            // start of a verse. The solution is to move to the start of the inline container.
            SelectionTransforms.moveToStartOfFirstLeaf(
                editor,
                anchorVersePath.concat(1)
            )
        } else if (Range.isBackward(selection)) {
            // There is currently no solution to the problem when the user selects backwards
            // through a verse number. Setting the focus to the start of the verse at which
            // the selection began seems reasonable, but it does not consistently work.
            Transforms.deselect(this.slateEditor)
        } else if (Range.isForward(selection) && anchorVersePath) {
            // When the user selects forwards through a verse number, we need to set
            // the focus to the end of the verse at which they started the selection.
            // If the errant selection was the result of a double/triple click, we can be assured
            // that the user's selection came from the left (see the jsdoc for SelectionSeparator),
            // so we take the same action here.
            SelectionTransforms.moveToEndOfLastLeaf(editor, anchorVersePath, {
                edge: "focus",
            })
        }
    }

    updateIdentificationFromProp = (): void => {
        if (!this.props.identification) return
        const current = MyEditor.identification(this.slateEditor)
        const validUpdates = this.filterAndNormalize(this.props.identification)
        const updated = mergeIdentification(current, validUpdates)

        if (!isEqual(updated, current)) {
            MyTransforms.setIdentification(this.slateEditor, updated)
            if (this.props.onIdentificationChange) {
                this.props.onIdentificationChange(updated)
            }
        }
    }

    updateIdentificationFromUsfm = (): void => {
        const parsedIdentification = parseIdentificationFromUsfm(
            this.props.usfmString
        )
        const validParsed = this.filterAndNormalize(parsedIdentification)

        MyTransforms.setIdentification(this.slateEditor, validParsed)
        if (this.props.onIdentificationChange) {
            this.props.onIdentificationChange(validParsed)
        }
    }

    updateIdentificationFromUsfmAndProp = (): void => {
        const parsedIdentification = parseIdentificationFromUsfm(
            this.props.usfmString
        )
        const validParsed = this.filterAndNormalize(parsedIdentification)
        const updateIdentification = this.props.identification ?? {}
        const validUpdates = this.filterAndNormalize(updateIdentification)
        const updated = mergeIdentification(validParsed, validUpdates)

        MyTransforms.setIdentification(this.slateEditor, updated)
        if (this.props.onIdentificationChange) {
            this.props.onIdentificationChange(updated)
        }
    }

    filterAndNormalize = (
        ids: IdentificationHeaders
    ): IdentificationHeaders => {
        const filtered = filterInvalidIdentification(ids)
        return normalizeIdentificationValues(filtered)
    }

    updateSelectedVerseAfterEditorChange = (): void => {
        if (!this.slateEditor.selection) return

        const verseNodeEntry = MyEditor.getVerseNode(this.slateEditor)
        if (!verseNodeEntry) return

        const [verseNode] = verseNodeEntry
        const chapterNode = MyEditor.getChapterNode(this.slateEditor)?.[0]
        if (!Element.isElement(chapterNode) || !Element.isElement(verseNode))
            return

        const chapterNum = parseInt(Node.string(chapterNode.children[0]))
        const verseNumOrRangeStr = Node.string(verseNode.children[0])

        if (this.didSelectedVerseChange(chapterNum, verseNumOrRangeStr)) {
            this.updateSelectedVerse(chapterNum, verseNumOrRangeStr)
        }
    }

    updateSelectedVerse(chapter: number, verseNumOrRange: string): void {
        const { verseStart, verseEnd } = getVerseStartAndEnd(verseNumOrRange)
        const newSelectedVerse = {
            chapter: chapter,
            verse: verseStart,
        }
        this.setState({ selectedVerse: newSelectedVerse })

        if (!this.props.onVerseChange) return
        this.props.onVerseChange({
            chapter,
            verseStart,
            verseEnd,
        })
    }

    didSelectedVerseChange(chapter: number, verseNumOrRange: string): boolean {
        const { verseStart } = getVerseStartAndEnd(verseNumOrRange)
        const newSelectedVerse = {
            chapter: chapter,
            verse: verseStart,
        }
        return !isEqual(newSelectedVerse, this.state.selectedVerse)
    }

    componentDidMount(): void {
        this.updateIdentificationFromUsfmAndProp()
        if (this.props.goToVerse) {
            this.goToVerse(this.props.goToVerse)
        }
    }

    componentDidUpdate(prevProps: UsfmEditorProps): void {
        if (
            prevProps.usfmString != this.props.usfmString &&
            prevProps.identification != this.props.identification
        ) {
            this.updateIdentificationFromUsfmAndProp()
        } else if (prevProps.identification != this.props.identification) {
            this.updateIdentificationFromProp()
        } else if (prevProps.usfmString != this.props.usfmString) {
            this.updateIdentificationFromUsfm()
        }

        if (prevProps.usfmString != this.props.usfmString) {
            Transforms.deselect(this.slateEditor)
        }

        if (!isEqual(prevProps.goToVerse, this.props.goToVerse)) {
            this.goToVerse(this.props.goToVerse)
        }
    }

    render(): JSX.Element {
        // The selection may be invalid if the slate value is updated by an external source,
        // e.g. when the usfmString property just changed.
        if (
            this.slateEditor.selection &&
            isInvalidRange(this.slateEditor.selection, this.state.value)
        ) {
            Transforms.deselect(this.slateEditor)
        }
        return (
            <Slate
                editor={this.slateEditor}
                value={this.state.value}
                onChange={this.handleChange}
            >
                <HoveringToolbar usfmEditor={this} />
                <Editable
                    readOnly={this.props.readOnly}
                    renderElement={renderElementByType}
                    renderLeaf={renderLeafByProps}
                    spellCheck={false}
                    onKeyDown={this.onKeyDown}
                    className={"usfm-editor"}
                />
            </Slate>
        )
    }
}

interface BasicUsfmEditorState {
    value: Node[]
    selectedVerse?: Verse
    prevUsfmStringProp: string
}

interface VerseStartAndEnd {
    verseStart: number
    verseEnd: number
}

function getVerseStartAndEnd(verseNumOrRange: string): VerseStartAndEnd {
    if (verseNumOrRange == "front") return { verseStart: 0, verseEnd: 0 }

    const [startVerseStr, endVerseStrOrNull] = verseNumOrRange.split("-")
    const verseStart = parseInt(startVerseStr)
    const verseEnd = parseInt(endVerseStrOrNull) || verseStart
    return { verseStart, verseEnd }
}

function isInvalidRange(range: Range, nodes: Node[]): boolean {
    const anchorPath = range.anchor.path
    const focusPath = range.focus.path
    return (
        nodes.length <= Math.min(anchorPath[0], focusPath[0]) ||
        !Node.has(nodes[anchorPath[0]], anchorPath.slice(1)) ||
        !Node.has(nodes[focusPath[0]], focusPath.slice(1))
    )
}
