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
import { OptionsContext } from "./OptionsContext"
import { UIComponentContext } from "./injectedUI/UIComponentContext"
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
    createBasicUsfmEditor,
    withChapterPaging,
    withChapterSelection,
    OptionsContext,
    UIComponentContext,
}
