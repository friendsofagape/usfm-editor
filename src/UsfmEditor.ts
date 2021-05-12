import { noop } from "lodash"
import PropTypes from "prop-types"
import { ToolbarSpecs } from "./components/UsfmToolbar"

export type IdentificationHeaders = Record<string, string | string[] | null>

export interface UsfmEditorRef {
    getMarksAtSelection: () => string[]
    addMarkAtSelection: (mark: string) => void
    removeMarkAtSelection: (mark: string) => void
    getParagraphTypesAtSelection: () => string[]
    setParagraphTypeAtSelection: (marker: string) => void
    goToVerse: (verseObject: Verse) => void
}

export interface UsfmEditorProps {
    usfmString: string
    onChange?: (usfm: string) => void
    readOnly?: boolean
    identification?: IdentificationHeaders
    onIdentificationChange?: (identification: IdentificationHeaders) => void
    goToVerse?: Verse
    onVerseChange?: (verseRange: VerseRange) => void
    toolbarSpecs?: ToolbarSpecs
}

export const usfmEditorPropTypes = {
    usfmString: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    readOnly: PropTypes.bool,
    identification: PropTypes.object,
    onIdentificationChange: PropTypes.func,
    goToVerse: PropTypes.object,
    onVerseChange: PropTypes.func,
    toolbarSpecs: PropTypes.object,
}

export const usfmEditorDefaultProps: Partial<UsfmEditorProps> = {
    onChange: noop,
    readOnly: false,
    identification: {},
    onIdentificationChange: noop,
    goToVerse: undefined,
    onVerseChange: undefined,
    toolbarSpecs: {},
}

export type Verse = {
    chapter: number
    verse: number
    key?: any
}

// VerseRange is essentially a superset of Verse, because it can specify a singular verse if
// verseEnd = verseStart.
export type VerseRange = {
    chapter: number
    verseStart: number
    verseEnd: number
}

export type ForwardRefUsfmEditor<
    R extends UsfmEditorRef
> = React.ForwardRefExoticComponent<UsfmEditorProps & React.RefAttributes<R>>

// "Higher order component" Usfm Editor Props, for an editor that will wrap another editor
export type HocUsfmEditorProps<W extends UsfmEditorRef> = UsfmEditorProps &
    HasWrappedEditor<W>

interface HasWrappedEditor<W extends UsfmEditorRef> {
    wrappedEditor: ForwardRefUsfmEditor<W>
}
