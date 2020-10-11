import * as React from "react";
import { UsfmEditorRef, ForwardRefUsfmEditor, HocUsfmEditorProps, usfmEditorPropTypes, usfmEditorDefaultProps, Verse, VerseRange } from "../UsfmEditor";
import { NoopUsfmEditor } from "../NoopUsfmEditor";

export function withChapterPaging(WrappedEditor: ForwardRefUsfmEditor): ForwardRefUsfmEditor {
    return React.forwardRef<ChapterEditor, HocUsfmEditorProps>(({ ...props }, ref) =>
        <ChapterEditor
            {...props}
            wrappedEditor={WrappedEditor}
            ref={ref} // used to access the ChapterEditor and its API
        />
    )
}

class ChapterEditor extends React.Component<HocUsfmEditorProps, ChapterEditorState> implements UsfmEditorRef {
    public static propTypes = usfmEditorPropTypes
    public static defaultProps = usfmEditorDefaultProps

    constructor(props: HocUsfmEditorProps) {
        super(props)
        this.state = { 
            selectedVerse: null,
            goToVersePropValue: null
        }
    }

    wrappedEditorRef = React.createRef<UsfmEditorRef>()
    wrappedEditorInstance: () => UsfmEditorRef = () => 
        this.wrappedEditorRef.current ?? new NoopUsfmEditor()
    
    /* UsfmEditor API */

    getMarksAtCursor = () =>
        this.wrappedEditorInstance().getMarksAtCursor()

    addMarkAtCursor = (mark: string) =>
        this.wrappedEditorInstance().addMarkAtCursor(mark)

    removeMarkAtCursor = (mark: string) =>
        this.wrappedEditorInstance().removeMarkAtCursor(mark)

    getParagraphTypesAtCursor = () =>
        this.wrappedEditorInstance().getParagraphTypesAtCursor()

    setParagraphTypeAtCursor = (marker: string) =>
        this.wrappedEditorInstance().setParagraphTypeAtCursor(marker)

    goToVerse = (verse: Verse) =>
        this.wrappedEditorInstance().goToVerse(verse)

    /* End UsfmEditor API */

    callGoToVerse = (chapterStr: string, verseStr: string) => {
        const chapter = parseInt(chapterStr)
        const verse = parseInt(verseStr)
        if (chapter >= 0 && verse >= 0) {
            this.wrappedEditorInstance().goToVerse({
                chapter: chapter,
                verse: verse
            })
        }
    }

    setGoToVerseProp = (chapterStr: string, verseStr: string) => {
        const chapter = parseInt(chapterStr)
        const verse = parseInt(verseStr)
        if (chapter >= 0 && verse >= 0) {
            this.setState({ 
                goToVersePropValue: {
                    chapter: chapter,
                    verse: verse
                }
            })
        }
    }

    onVerseChange = (verseRange: VerseRange) => {
        this.setState({ 
            selectedVerse: {
                chapter: verseRange.chapter,
                verseStart: verseRange.verseStart,
                verseEnd: verseRange.verseEnd
            } 
        })
    }

    render() {
        return (
            <React.Fragment>
                <VerseSelector
                    text="Call goToVerse() API function:"
                    onChange={this.callGoToVerse} />
                <VerseSelector
                    text="Set goToVerse Prop:"
                    onChange={this.setGoToVerseProp} />
                <SelectedVerseTracker
                    selectedVerse={this.state.selectedVerse} />
                <hr className="hr-separator"/>
                <this.props.wrappedEditor 
                    {...this.props} 
                    ref={this.wrappedEditorRef} 
                    goToVerse={this.state.goToVersePropValue}
                    onVerseChange={this.onVerseChange}
                />
            </React.Fragment>
        )
    }
}

type ChapterEditorState = {
    selectedVerse: VerseRange,
    goToVersePropValue: Verse
}


const VerseSelector: React.FunctionComponent<VerseSelectorProps> = ({ text, onChange }) => {
    const chapterInputRef = React.createRef<HTMLInputElement>()
    const verseInputRef = React.createRef<HTMLInputElement>()
    return (
        <div className="verse-selector">
            <div className="row">
                <div className="column">
                    <h4 className="demo-header no-margin-top">
                        {text}
                    </h4>
                </div>
            </div>
            Chapter:
            <input 
                className="verse-selector-input"
                type="text" 
                onKeyPress={allowOnlyNumbers}
                ref={chapterInputRef} 
            />
            Verse:
            <input 
                className="verse-selector-input"
                type="text" 
                onKeyPress={allowOnlyNumbers}
                ref={verseInputRef} 
            />
            <button onClick={event => 
                onChange(
                    chapterInputRef.current.value,
                    verseInputRef.current.value
                )
            }>Set</button>
        </div>
    )
}

interface VerseSelectorProps {
    text: string,
    onChange: (chapterStr: string, verseStr: string) => void
}

const SelectedVerseTracker: React.FunctionComponent<SelectedVerseTrackerProps> = ({ selectedVerse }) => {
    return (
        <div>
            <div className="row">
                <div className="column">
                    <h4 className="demo-header no-margin-top">
                        Populated by onVerseChange:
                    </h4>
                </div>
            </div>
            <span className="verse-tracker-text">
                Chapter: {selectedVerse?.chapter ?? ""}
            </span>
            <span className="verse-tracker-text">
                Verse: {selectedVerse?.verseStart ?? ""}
            </span>
            <span className="verse-tracker-text">
                VerseRangeEnd: {selectedVerse?.verseEnd ?? ""}
            </span>
        </div>
    )
}

interface SelectedVerseTrackerProps {
    selectedVerse: VerseRange
}

const allowOnlyNumbers = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.charCode < 48 || event.charCode > 57) // allow only 0-9
    {
        event.preventDefault();
    }
}