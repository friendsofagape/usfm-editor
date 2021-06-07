import * as React from "react"
import { flowRight } from "lodash"
import {
    ForwardRefUsfmEditor,
    UsfmEditorProps,
    UsfmEditorRef,
    usfmEditorDefaultProps,
    usfmEditorPropTypes,
    Verse,
} from "../UsfmEditor"
import { createBasicUsfmEditor } from "../components/BasicUsfmEditor"
import { withChapterPaging } from "../components/ChapterEditor"
import { withChapterSelection } from "../components/ChapterSelectionEditor"
import { withToolbar } from "../components/ToolbarEditor"
import { NoopUsfmEditor } from "../NoopUsfmEditor"

export function createFullFeaturedEditor(): ForwardRefUsfmEditor<
    UsfmEditorRef
> {
    return flowRight(
        withChapterSelection,
        withChapterPaging,
        withToolbar,
        createBasicUsfmEditor
    )()
}

/**
 * A WYSIWYG editor component for USFM
 */
export class FullUsfmEditor
    extends React.Component<UsfmEditorProps>
    implements UsfmEditorRef {
    public static propTypes = usfmEditorPropTypes
    public static defaultProps = usfmEditorDefaultProps

    Editor: ForwardRefUsfmEditor<UsfmEditorRef> = createFullFeaturedEditor()

    editorRef = React.createRef<UsfmEditorRef>()
    editorInstance: () => UsfmEditorRef = () =>
        this.editorRef.current ?? new NoopUsfmEditor()

    getMarksAtSelection = (): string[] =>
        this.editorInstance().getMarksAtSelection()

    addMarkAtSelection = (mark: string): void =>
        this.editorInstance().addMarkAtSelection(mark)

    removeMarkAtSelection = (mark: string): void =>
        this.editorInstance().removeMarkAtSelection(mark)

    getParagraphTypesAtSelection = (): string[] =>
        this.editorInstance().getParagraphTypesAtSelection()

    setParagraphTypeAtSelection = (marker: string): void =>
        this.editorInstance().setParagraphTypeAtSelection(marker)

    goToVerse = (verseObject: Verse): void =>
        this.editorInstance().goToVerse(verseObject)

    render(): React.ReactElement {
        return <this.Editor {...this.props} ref={this.editorRef} />
    }
}
