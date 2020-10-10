import * as React from "react";
import { withReact, Slate, Editable, ReactEditor } from "slate-react";
import { createEditor, Transforms, Editor, Node, Range } from 'slate';
import { renderElementByType, renderLeafByProps } from '../transforms/usfmRenderer';
import { usfmToSlate } from '../transforms/usfmToSlate';
import { withNormalize } from "../plugins/normalizeNode";
import { handleKeyPress, withBackspace, withDelete, withEnter } from '../plugins/keyHandlers';
import { slateToUsfm } from "../transforms/slateToUsfm";
import { debounce } from "debounce";
import { flowRight, isEqual } from "lodash"
import { MyTransforms } from "../plugins/helpers/MyTransforms";
import { SelectionTransforms } from "../plugins/helpers/SelectionTransforms";
import { parseIdentificationFromUsfm, 
         filterInvalidIdentification,
         mergeIdentification,
         normalizeIdentificationValues
} from "../transforms/identificationTransforms";
import { MyEditor } from "../plugins/helpers/MyEditor";
import "./default.css";
import { UsfmEditorRef, UsfmEditorProps, ForwardRefUsfmEditor, usfmEditorPropTypes, usfmEditorDefaultProps } from "../UsfmEditor";
import NodeRules from "../utils/NodeRules";
import { UsfmMarkers } from "../utils/UsfmMarkers";
import { HoveringToolbar } from "./HoveringToolbar";

export const createBasicUsfmEditor: () => ForwardRefUsfmEditor =
    () => React.forwardRef<BasicUsfmEditor, UsfmEditorProps>(({ ...props }, ref) => 
        <BasicUsfmEditor
            {...props}
            ref={ref}
        />
    )

/**
 * A WYSIWYG editor component for USFM
 */
export class BasicUsfmEditor extends React.Component<UsfmEditorProps, BasicUsfmEditorState> implements UsfmEditorRef {
    public static propTypes = usfmEditorPropTypes
    public static defaultProps = usfmEditorDefaultProps

    slateEditor: ReactEditor

    constructor(props: UsfmEditorProps) {
        super(props)
        this.state = {
            value: usfmToSlate(props.usfmString)
        }

        this.slateEditor = flowRight(
            withBackspace,
            withDelete,
            withEnter,
            withNormalize,
            withReact,
            createEditor
        )()
        this.slateEditor.isInline = element => {
            return false
        }
    }
    
    /* UsfmEditor interface functions */

    getMarksAtCursor: () => string[] = () => {
        if (!this.slateEditor.selection) return []
        const record = Editor.marks(this.slateEditor);
        const markArray = Object.keys(record).filter((k: string) => record[k] === true);
        return markArray
    }

    addMarkAtCursor: (mark: string) => void = (mark) => {
        if (!this.slateEditor.selection) return
        Editor.addMark(this.slateEditor, mark, true)
    }

    removeMarkAtCursor: (mark: string) => void = (mark) => {
        if (!this.slateEditor.selection) return
        Editor.removeMark(this.slateEditor, mark)
    }

    getParagraphTypesAtCursor: () => string[] = () => {
        if (!this.slateEditor.selection) return []
        let types = []
        const nodes = Editor.nodes(this.slateEditor)
        //@ts-ignore
        let entry = nodes.next()
        while (!entry.done) {
            const node = entry.value[0]
            if (UsfmMarkers.isParagraphType(node)) {
                types = types.concat(node.type)
            }
            //@ts-ignore
            entry = nodes.next()
        }
        return types
    }

    setParagraphTypeAtCursor: (marker: string) => void = (marker) => {
        if (!this.slateEditor.selection) return
        Transforms.setNodes(
            this.slateEditor,
            { type: marker },
            { match: NodeRules.isFormattableBlockType }
        )
    }

    /* BasicUsfmEditor functions */

    handleChange: (value: Node[]) => void = value => {
        console.debug("after change", value)
        this.fixSelectionOnChapterOrVerseNumber()
        this.setState({ value: value })
        this.scheduleOnChange(value)
    }

    scheduleOnChange: (value: Node[]) => void = debounce(function(newValue) {
        const usfm = slateToUsfm(newValue)
        this.props.onChange(usfm)
    }, 200)

    onKeyDown = event => {
        handleKeyPress(event, this.slateEditor)
    }

    fixSelectionOnChapterOrVerseNumber() {
        const editor = this.slateEditor
        if (! MyEditor.isVerseOrChapterNumberSelected(editor)) return

        console.debug("selection before correction: ", editor.selection)

        const [_, anchorVersePath] = MyEditor.getVerse(editor, editor.selection.anchor.path)

        if (Range.isCollapsed(editor.selection)) {
            // This can happen when nodes get merged after the user presses delete at the 
            // start of a verse. The solution is to move to the start of the inline container.
            SelectionTransforms.moveToStartOfFirstLeaf(editor, anchorVersePath.concat(1))
            return
        }

        if (Range.isBackward(editor.selection)) {
            // There is currently no solution to the problem when the user selects backwards
            // through a verse number. Setting the focus to the start of the verse at which
            // the selection began seems reasonable, but it does not consistently work.
            Transforms.deselect(this.slateEditor)
        } else {
            // When the user selects forwards through a verse number, we need to set
            // the focus to the end of the verse at which they started the selection.
            // If the errant selection was the result of a double/triple click, we can be assured
            // that the user's selection came from the left (see the jsdoc for SelectionSeparator),
            // so we take the same action here.
            SelectionTransforms.moveToEndOfLastLeaf(editor, anchorVersePath, { edge: "focus" })
        }
    }

    updateIdentificationFromProp = () => {
        const current = MyEditor.identification(this.slateEditor)
        const validUpdates = this.filterAndNormalize(this.props.identification)
        const updated = mergeIdentification(current, validUpdates)

        if (! isEqual(updated, current)) {
            MyTransforms.setIdentification(this.slateEditor, updated)
            if (this.props.onIdentificationChange) {
                this.props.onIdentificationChange(updated)
            }
        }
    }

    updateIdentificationFromUsfmAndProp = () => {
        const parsedIdentification = parseIdentificationFromUsfm(this.props.usfmString)
        const validParsed = this.filterAndNormalize(parsedIdentification)
        const validUpdates = this.filterAndNormalize(this.props.identification)
        const updated = mergeIdentification(validParsed, validUpdates)

        MyTransforms.setIdentification(this.slateEditor, updated)
        if (this.props.onIdentificationChange) {
            this.props.onIdentificationChange(updated)
        }
    }

    filterAndNormalize = (idJson: Object) => {
        const filtered = filterInvalidIdentification(idJson)
        return normalizeIdentificationValues(filtered)
    }

    componentDidMount() {
        this.updateIdentificationFromUsfmAndProp()
    }
    
    componentDidUpdate(prevProps) {
        if (prevProps.usfmString != this.props.usfmString) {
            this.updateIdentificationFromUsfmAndProp()
        } else if (prevProps.identification != this.props.identification) {
            this.updateIdentificationFromProp()
        }
    }

    render() {
        return (
            <Slate
                editor={this.slateEditor}
                value={this.state.value}
                onChange={this.handleChange}
            >
                <HoveringToolbar />
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
    value: any,
}