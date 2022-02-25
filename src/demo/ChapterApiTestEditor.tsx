import * as React from "react"
import {
    UsfmEditorRef,
    ForwardRefUsfmEditor,
    HocUsfmEditorProps,
    usfmEditorPropTypes,
    usfmEditorDefaultProps,
    Verse,
    VerseRange,
} from "../UsfmEditor"
import { NoopUsfmEditor } from "../NoopUsfmEditor"
import { UsfmEditorProps } from ".."

export function withChapterApiTest<W extends UsfmEditorRef>(
    WrappedEditor: ForwardRefUsfmEditor<W>
): ForwardRefUsfmEditor<ChapterApiTestEditor<W>> {
    const fc = React.forwardRef<ChapterApiTestEditor<W>, UsfmEditorProps>(
        ({ ...props }, ref) => (
            <ChapterApiTestEditor
                {...props}
                wrappedEditor={WrappedEditor}
                ref={ref} // used to access the ChapterApiTestEditor and its API
            />
        )
    )
    fc.displayName = (WrappedEditor.displayName ?? "") + "withChapterApiTest"
    return fc
}

class ChapterApiTestEditor<W extends UsfmEditorRef>
    extends React.Component<HocUsfmEditorProps<W>, ChapterApiTestEditorState>
    implements UsfmEditorRef
{
    public static propTypes = usfmEditorPropTypes
    public static defaultProps = usfmEditorDefaultProps

    constructor(props: HocUsfmEditorProps<W>) {
        super(props)
        this.state = {
            selectedVerse: undefined,
            goToVersePropValue: props.goToVerse,
        }
    }

    wrappedEditorRef = React.createRef<W>()
    wrappedEditorInstance: () => UsfmEditorRef = () =>
        this.wrappedEditorRef.current ?? new NoopUsfmEditor()

    /* UsfmEditor API */

    getMarksAtSelection = (): string[] =>
        this.wrappedEditorInstance().getMarksAtSelection()

    addMarkAtSelection = (mark: string): void =>
        this.wrappedEditorInstance().addMarkAtSelection(mark)

    removeMarkAtSelection = (mark: string): void =>
        this.wrappedEditorInstance().removeMarkAtSelection(mark)

    getParagraphTypesAtSelection = (): string[] =>
        this.wrappedEditorInstance().getParagraphTypesAtSelection()

    setParagraphTypeAtSelection = (marker: string): void =>
        this.wrappedEditorInstance().setParagraphTypeAtSelection(marker)

    goToVerse = (verseObject: Verse): void =>
        this.wrappedEditorInstance().goToVerse(verseObject)

    /* End UsfmEditor API */

    callGoToVerse = (chapterStr: string, verseStr: string) => {
        const chapter = parseInt(chapterStr)
        const verse = parseInt(verseStr)
        if (chapter >= 0 && verse >= 0) {
            this.goToVerse({
                chapter: chapter,
                verse: verse,
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
                    verse: verse,
                    key: Date.now(),
                },
            })
        }
    }

    onVerseChange = (verseRange: VerseRange) => {
        this.setState({
            selectedVerse: {
                chapter: verseRange.chapter,
                verseStart: verseRange.verseStart,
                verseEnd: verseRange.verseEnd,
            },
        })
    }

    render(): JSX.Element {
        return (
            <React.Fragment>
                <VerseSelector
                    text="Call goToVerse() API function:"
                    onChange={this.callGoToVerse}
                />
                <VerseSelector
                    text="Set goToVerse Prop:"
                    onChange={this.setGoToVerseProp}
                />
                <SelectedVerseTracker
                    selectedVerse={this.state.selectedVerse}
                />
                <hr className="hr-separator" />
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

type ChapterApiTestEditorState = {
    selectedVerse?: VerseRange
    goToVersePropValue?: Verse
}

const VerseSelector: React.FC<VerseSelectorProps> = ({
    text,
    onChange,
}: VerseSelectorProps) => {
    const chapterInputRef = React.createRef<HTMLInputElement>()
    const verseInputRef = React.createRef<HTMLInputElement>()
    return (
        <div className="usfm-editor-verse-selector">
            <div className="row">
                <div className="column">
                    <h4 className="demo-header no-margin-top">{text}</h4>
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
            <button
                onClick={(event) => {
                    if (chapterInputRef.current && verseInputRef.current)
                        onChange(
                            chapterInputRef.current.value,
                            verseInputRef.current.value
                        )
                }}
            >
                Set
            </button>
        </div>
    )
}

interface VerseSelectorProps {
    text: string
    onChange: (chapterStr: string, verseStr: string) => void
}

const SelectedVerseTracker: React.FC<SelectedVerseTrackerProps> = ({
    selectedVerse,
}: SelectedVerseTrackerProps) => {
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
    selectedVerse?: VerseRange
}

const allowOnlyNumbers = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.charCode < 48 || event.charCode > 57) {
        // allow only 0-9
        event.preventDefault()
    }
}
