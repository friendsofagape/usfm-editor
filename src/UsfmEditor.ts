import { noop } from "lodash"
import PropTypes from "prop-types"

export type IdentificationHeaders = Record<string, string | string[] | null>

export interface UsfmEditorRef {
    getMarksAtCursor: () => string[]
    addMarkAtCursor: (mark: string) => void
    removeMarkAtCursor: (mark: string) => void
    getParagraphTypesAtCursor: () => string[]
    setParagraphTypeAtCursor: (marker: string) => void
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
}

export const usfmEditorPropTypes = {
    usfmString: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    readOnly: PropTypes.bool,
    identification: PropTypes.object,
    onIdentificationChange: PropTypes.func,
    goToVerse: PropTypes.object,
    onVerseChange: PropTypes.func,
}

export const usfmEditorDefaultProps = {
    onChange: noop,
    readOnly: false,
    identification: {},
    onIdentificationChange: noop,
    goToVerse: undefined,
    onVerseChange: undefined,
}

export type Verse = { chapter: number; verse: number }

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
