import * as React from "react"
import {
    UsfmEditorRef,
    ForwardRefUsfmEditor,
    HocUsfmEditorProps,
    usfmEditorPropTypes,
    usfmEditorDefaultProps,
    Verse,
} from "../UsfmEditor"
import { NoopUsfmEditor } from "../NoopUsfmEditor"
import { UsfmEditorProps } from ".."
import { ChapterEditor } from "../components/ChapterEditor"
import { isEqual } from "lodash"
import { Button, TextField } from "@material-ui/core"

export function withChapterSelection<W extends UsfmEditorRef>(
    WrappedEditor: ForwardRefUsfmEditor<W>
): ForwardRefUsfmEditor<ChapterSelectionEditor<W>> {
    const fc = React.forwardRef<ChapterSelectionEditor<W>, UsfmEditorProps>(
        ({ ...props }, ref) => (
            <ChapterSelectionEditor
                {...props}
                wrappedEditor={WrappedEditor}
                ref={ref} // used to access the ChapterSelectionEditor and its API
            />
        )
    )
    fc.displayName = (WrappedEditor.displayName ?? "") + "withChapterApiTest"
    return fc
}

class ChapterSelectionEditor<W extends UsfmEditorRef>
    extends React.Component<HocUsfmEditorProps<W>, ChapterSelectionEditorState>
    implements UsfmEditorRef {
    public static propTypes = usfmEditorPropTypes
    public static defaultProps = usfmEditorDefaultProps

    constructor(props: HocUsfmEditorProps<W>) {
        super(props)
        this.state = {
            goToVersePropValue:
                props.goToVerse || ChapterEditor.defaultGoToVerse,
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

    goToVerse = (verseObject: Verse): void => {
        this.setState({
            goToVersePropValue: {
                chapter: verseObject.chapter,
                verse: verseObject.verse,
                key: Date.now(),
            },
        })
    }

    /* End UsfmEditor API */

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

    componentDidUpdate(prevProps: UsfmEditorProps): void {
        if (
            !isEqual(prevProps.goToVerse, this.props.goToVerse) &&
            this.props.goToVerse
        ) {
            this.setState({ goToVersePropValue: this.props.goToVerse })
        }
    }

    render(): JSX.Element {
        return (
            <React.Fragment>
                <VerseSelector
                    onChange={this.setGoToVerseProp}
                    initialVerse={this.state.goToVersePropValue}
                    key={verseObjectToString(this.state.goToVersePropValue)}
                />
                <hr className="hr-separator" />
                <this.props.wrappedEditor
                    {...this.props}
                    ref={this.wrappedEditorRef}
                    goToVerse={this.state.goToVersePropValue}
                />
            </React.Fragment>
        )
    }
}

type ChapterSelectionEditorState = {
    goToVersePropValue: Verse
}

const VerseSelector: React.FC<VerseSelectorProps> = ({
    onChange,
    initialVerse,
}: VerseSelectorProps) => {
    const chapterInputRef = React.createRef<HTMLInputElement>()
    const verseInputRef = React.createRef<HTMLInputElement>()
    return (
        <div className="verse-selector">
            <TextField
                className="text-field"
                label="Chapter"
                type="number"
                InputLabelProps={{
                    shrink: true,
                }}
                variant="outlined"
                defaultValue={initialVerse.chapter}
                inputRef={chapterInputRef}
                onKeyPress={allowOnlyNumbers}
                size="small"
                InputProps={{ inputProps: { min: 1 } }}
            />
            <TextField
                className="text-field"
                label="Verse"
                type="number"
                InputLabelProps={{
                    shrink: true,
                }}
                variant="outlined"
                defaultValue={initialVerse.verse}
                inputRef={verseInputRef}
                onKeyPress={allowOnlyNumbers}
                size="small"
                InputProps={{ inputProps: { min: 0 } }}
            />
            <Button
                className="verse-selector-go-button"
                variant="contained"
                disableElevation
                onClick={(event) => {
                    if (chapterInputRef.current && verseInputRef.current)
                        onChange(
                            chapterInputRef.current.value,
                            verseInputRef.current.value
                        )
                }}
            >
                Go
            </Button>
        </div>
    )
}

interface VerseSelectorProps {
    onChange: (chapterStr: string, verseStr: string) => void
    initialVerse: Verse
}

const allowOnlyNumbers = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.charCode < 48 || event.charCode > 57) {
        // allow only 0-9
        event.preventDefault()
    }
}

const verseObjectToString = (verseObject: Verse): string =>
    verseObject.chapter.toString().concat(verseObject.verse.toString())
