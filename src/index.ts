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
import {
    createFullFeaturedEditor,
    FullUsfmEditor,
} from "./components/FullUsfmEditor"
import { withChapterPaging } from "./components/ChapterEditor"
import { withChapterSelection } from "./components/ChapterSelectionEditor"
import { withToolbar } from "./components/ToolbarEditor"
import { OptionsContext } from "./OptionsContext"
import { UIComponentContext } from "./injectedUI/UIComponentContext"
import { ToolbarSpecs } from "./components/UsfmToolbar"
import { UsfmMarkers } from "./utils/UsfmMarkers"
import { flow } from "lodash"

/**
 * A UsfmEditor component with all features.
 * This editor can be given a ref of type UsfmEditorRef to have access to the editor API
 * (use `React.createRef<UsfmEditorRef>`).
 */
const UsfmEditor = flow(
    // Add wrapping HOCs to the end of this list
    createBasicUsfmEditor // , withToolbarEditor, withChapterPagingEditor
)()

export {
    UsfmEditor,
    UsfmEditorRef,
    UsfmEditorProps,
    usfmEditorPropTypes,
    ForwardRefUsfmEditor,
    HocUsfmEditorProps,
    usfmEditorDefaultProps,
    BasicUsfmEditor,
    FullUsfmEditor,
    createBasicUsfmEditor,
    createFullFeaturedEditor,
    withChapterPaging,
    withChapterSelection,
    withToolbar,
    OptionsContext,
    UIComponentContext,
    ToolbarSpecs,
    UsfmMarkers,
}
