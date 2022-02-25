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
import { FormControl, MenuItem, Select } from "@material-ui/core"

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
    implements UsfmEditorRef
{
    public static propTypes = usfmEditorPropTypes
    public static defaultProps = usfmEditorDefaultProps

    constructor(props: HocUsfmEditorProps<W>) {
        super(props)
        const chapterNumbers: number[] = getChapterNumbers(props.usfmString)
        this.state = {
            goToVersePropValue: getValidGoToVerse(
                chapterNumbers,
                props.goToVerse || ChapterEditor.defaultGoToVerse
            ),
            chapterNumbers: chapterNumbers,
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
        if (this.state.chapterNumbers.includes(verseObject.chapter)) {
            this.setState({
                goToVersePropValue: {
                    chapter: verseObject.chapter,
                    verse: verseObject.verse,
                    key: Date.now(),
                },
            })
        }
    }

    /* End UsfmEditor API */

    setGoToVerseProp = (chapterStr: string) => {
        this.setState({
            goToVersePropValue: {
                chapter: parseInt(chapterStr),
                verse: 1,
                key: Date.now(),
            },
        })
    }

    componentDidUpdate(prevProps: UsfmEditorProps): void {
        if (
            !isEqual(prevProps.goToVerse, this.props.goToVerse) &&
            this.props.goToVerse &&
            this.state.chapterNumbers.includes(this.props.goToVerse.chapter)
        ) {
            this.setState({ goToVersePropValue: this.props.goToVerse })
        }
        if (prevProps.usfmString != this.props.usfmString) {
            this.setState({
                chapterNumbers: getChapterNumbers(this.props.usfmString),
            })
        }
    }

    render(): JSX.Element {
        return (
            <React.Fragment>
                <ChapterSelector
                    onChange={this.setGoToVerseProp}
                    initialVerse={this.state.goToVersePropValue}
                    chapterNumbers={this.state.chapterNumbers}
                    key={this.state.goToVersePropValue.chapter}
                />
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
    chapterNumbers: number[]
}

const ChapterSelector: React.FC<ChapterSelectorProps> = ({
    onChange,
    initialVerse,
    chapterNumbers,
}: ChapterSelectorProps) => {
    return (
        <div className="verse-selector usfm-editor-border-bottom">
            <FormControl variant="outlined" className="chapter-selector">
                <Select
                    defaultValue={initialVerse.chapter}
                    onChange={(event) => {
                        onChange(event.target.value as string)
                    }}
                >
                    {chapterNumbers.map((chapterNum) => (
                        <MenuItem value={chapterNum} key={chapterNum}>
                            {chapterNum}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    )
}

interface ChapterSelectorProps {
    onChange: (chapterStr: string) => void
    initialVerse: Verse
    chapterNumbers: number[]
}

function getValidGoToVerse(
    validChapterNumbers: number[],
    desiredVerse: Verse
): Verse {
    return validChapterNumbers.includes(desiredVerse.chapter)
        ? desiredVerse
        : { chapter: validChapterNumbers[0], verse: 1 }
}

function getChapterNumbers(usfm: string): number[] {
    const matches: IterableIterator<RegExpMatchArray> =
        usfm.matchAll(/\\c\s*(\d+)/g)
    let chapterNumbers: number[] = []
    for (const m of matches) {
        chapterNumbers = chapterNumbers.concat(parseInt(m[1]))
    }
    return chapterNumbers
}
