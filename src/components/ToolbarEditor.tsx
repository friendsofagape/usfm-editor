import * as React from "react"
import {
    UsfmEditorRef,
    ForwardRefUsfmEditor,
    HocUsfmEditorProps,
    usfmEditorPropTypes,
    usfmEditorDefaultProps,
    Verse,
} from "../UsfmEditor"
import { NoopUsfmEditor } from "../NoopUsfmEditor"
import { UsfmEditorProps } from ".."
import { UsfmToolbar } from "./UsfmToolbar"

export function withToolbar<W extends UsfmEditorRef>(
    WrappedEditor: ForwardRefUsfmEditor<W>
): ForwardRefUsfmEditor<ToolbarEditor<W>> {
    const fc = React.forwardRef<ToolbarEditor<W>, UsfmEditorProps>(
        ({ ...props }, ref) => (
            <ToolbarEditor
                {...props}
                wrappedEditor={WrappedEditor}
                ref={ref} // used to access the ToolbarEditor and its API
            />
        )
    )
    fc.displayName = (WrappedEditor.displayName ?? "") + "WithToolbar"
    return fc
}

class ToolbarEditor<W extends UsfmEditorRef>
    extends React.Component<HocUsfmEditorProps<W>>
    implements UsfmEditorRef {
    public static propTypes = usfmEditorPropTypes
    public static defaultProps = usfmEditorDefaultProps

    constructor(props: HocUsfmEditorProps<W>) {
        super(props)
    }

    wrappedEditorRef = React.createRef<W>()
    wrappedEditorInstance: () => UsfmEditorRef = () =>
        this.wrappedEditorRef.current ?? new NoopUsfmEditor()

    getMarksAtSelection = () =>
        this.wrappedEditorInstance().getMarksAtSelection()

    addMarkAtSelection = (mark: string) =>
        this.wrappedEditorInstance().addMarkAtSelection(mark)

    removeMarkAtSelection = (mark: string) =>
        this.wrappedEditorInstance().removeMarkAtSelection(mark)

    getParagraphTypesAtSelection = () =>
        this.wrappedEditorInstance().getParagraphTypesAtSelection()

    setParagraphTypeAtSelection = (marker: string) =>
        this.wrappedEditorInstance().setParagraphTypeAtSelection(marker)

    goToVerse = (verse: Verse) => this.wrappedEditorInstance().goToVerse(verse)

    render() {
        if (!this.props.toolbarSpecs)
            console.warn("Toolbar specs not supplied to ToolbarEditor!")
        return (
            <React.Fragment>
                <UsfmToolbar
                    toolbarSpecs={this.props.toolbarSpecs || {}}
                    editor={this}
                />
                <this.props.wrappedEditor
                    {...this.props}
                    ref={this.wrappedEditorRef}
                />
            </React.Fragment>
        )
    }
}
