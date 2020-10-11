import PropTypes from "prop-types" 

export interface UsfmEditorRef {
    getMarksAtCursor: () => string[]
    addMarkAtCursor: (mark: string) => void
    removeMarkAtCursor: (mark: string) => void
    getParagraphTypesAtCursor: () => string[]
    setParagraphTypeAtCursor: (marker: string) => void
    goToVerse: (verse: Verse) => void
}

export interface UsfmEditorProps {
    usfmString: string,
    onChange?: (usfm: string) => void,
    readOnly?: boolean,
    identification?: Object,
    onIdentificationChange?: (identification: Object) => void,
    goToVerse?: Verse,
    onVerseChange?: (verseRange: VerseRange) => void
}

export const usfmEditorPropTypes = {
    usfmString: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    readOnly: PropTypes.bool,
    identification: PropTypes.object,
    onIdentificationChange: PropTypes.func,
    goToVerse: PropTypes.object,
    onVerseChange: PropTypes.func
}

export const usfmEditorDefaultProps = {
    onChange: () => {},
    readOnly: false,
    identification: {},
    onIdentificationChange: () => {},
    goToVerse: undefined,
    onVerseChange: undefined
}

export type Verse = {chapter: number, verse: number}

// VerseRange is essentially a superset of Verse, because it can specify a singular verse if
// verseEnd = verseStart.
export type VerseRange = {chapter: number, verseStart: number, verseEnd: number}

export type ForwardRefUsfmEditor = React.ForwardRefExoticComponent<UsfmEditorProps & React.RefAttributes<UsfmEditorRef>>

// "Higher order component" Usfm Editor Props, for an editor that will wrap another editor
export type HocUsfmEditorProps = UsfmEditorProps & HasWrappedEditor

interface HasWrappedEditor {
    wrappedEditor: ForwardRefUsfmEditor
}