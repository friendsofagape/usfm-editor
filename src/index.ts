import { UsfmEditorRef, UsfmEditorProps, usfmEditorPropTypes } from "./UsfmEditor"
import { BasicUsfmEditor, createBasicUsfmEditor } from "./components/BasicUsfmEditor"
import { OptionsContext } from "./OptionsContext"
import { VerseNumberMenu } from "./components/VerseNumberMenu"
import { flow } from "lodash";

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
    BasicUsfmEditor,
    createBasicUsfmEditor,
    OptionsContext,
    VerseNumberMenu
}
