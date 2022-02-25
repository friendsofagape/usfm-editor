import {
    UsfmEditorRef,
    UsfmEditorProps,
    usfmEditorPropTypes,
    ForwardRefUsfmEditor,
    HocUsfmEditorProps,
    usfmEditorDefaultProps,
} from "./UsfmEditor"
import {
    BasicUsfmEditor,
    createBasicUsfmEditor,
} from "./components/BasicUsfmEditor"
import { withChapterPaging } from "./components/ChapterEditor"
import { withChapterSelection } from "./components/ChapterSelectionEditor"
import { withToolbar } from "./components/ToolbarEditor"
import { OptionsContext } from "./OptionsContext"
import { UIComponentContext } from "./injectedUI/UIComponentContext"
import { UsfmToolbar, ToolbarSpecs } from "./components/UsfmToolbar"
import { UsfmMarkers } from "./utils/UsfmMarkers"
import styles from "./style.css"
import { flowRight } from "lodash"

/**
 * A UsfmEditor component with all features.
 * This editor can be given a ref of type UsfmEditorRef to have access to the editor API
 * (use `React.createRef<UsfmEditorRef>`).
 */
const UsfmEditor: ForwardRefUsfmEditor<UsfmEditorRef> = createUsfmEditor()

/**
 * Creates a usfm editor with all of the features.
 */
function createUsfmEditor(): ForwardRefUsfmEditor<UsfmEditorRef> {
    return flowRight(
        withChapterSelection,
        withChapterPaging,
        withToolbar,
        createBasicUsfmEditor
    )()
}

export {
    UsfmEditor,
    UsfmEditorRef,
    UsfmEditorProps,
    usfmEditorPropTypes,
    ForwardRefUsfmEditor,
    HocUsfmEditorProps,
    usfmEditorDefaultProps,
    BasicUsfmEditor,
    createUsfmEditor,
    createBasicUsfmEditor,
    withChapterPaging,
    withChapterSelection,
    withToolbar,
    OptionsContext,
    UIComponentContext,
    UsfmToolbar,
    ToolbarSpecs,
    UsfmMarkers,
    styles,
}
