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
import { isEqual } from "lodash"

export function withChapterPaging<W extends UsfmEditorRef>(
    WrappedEditor: ForwardRefUsfmEditor<W>
): ForwardRefUsfmEditor<ChapterEditor<W>> {
    const fc = React.forwardRef<ChapterEditor<W>, UsfmEditorProps>(
        ({ ...props }, ref) => (
            <ChapterEditor
                {...props}
                wrappedEditor={WrappedEditor}
                ref={ref} // used to access the ChapterEditor and its API
            />
        )
    )
    fc.displayName = (WrappedEditor.displayName ?? "") + "WithChapterPaging"
    return fc
}

export class ChapterEditor<W extends UsfmEditorRef>
    extends React.Component<HocUsfmEditorProps<W>, ChapterEditorState>
    implements UsfmEditorRef {
    public static propTypes = usfmEditorPropTypes
    public static defaultGoToVerse: Verse = { chapter: 1, verse: 1 }
    public static defaultProps: Partial<UsfmEditorProps> = {
        ...usfmEditorDefaultProps,
        goToVerse: ChapterEditor.defaultGoToVerse,
    }

    constructor(props: HocUsfmEditorProps<W>) {
        super(props)
        this.wholeBookUsfm = props.usfmString
        this.state = {
            chapterUsfmString: props.usfmString,
            goToVersePropValue: props.goToVerse,
        }
    }

    wholeBookUsfm: string

    wrappedEditorRef = React.createRef<W>()
    wrappedEditorInstance: () => UsfmEditorRef = () =>
        this.wrappedEditorRef.current ?? new NoopUsfmEditor()

    /* UsfmEditor API */

    getMarksAtCursor = (): string[] =>
        this.wrappedEditorInstance().getMarksAtCursor()

    addMarkAtCursor = (mark: string): void =>
        this.wrappedEditorInstance().addMarkAtCursor(mark)

    removeMarkAtCursor = (mark: string): void =>
        this.wrappedEditorInstance().removeMarkAtCursor(mark)

    getParagraphTypesAtCursor = (): string[] =>
        this.wrappedEditorInstance().getParagraphTypesAtCursor()

    setParagraphTypeAtCursor = (marker: string): void =>
        this.wrappedEditorInstance().setParagraphTypeAtCursor(marker)

    goToVerse = (verseObject: Verse): void => {
        const chapterUsfm = getSingleChapterAndBookHeaders(
            this.wholeBookUsfm,
            verseObject.chapter
        )
        const goToVersePropValue: Verse = {
            chapter: verseObject.chapter,
            verse: verseObject.verse,
            key: Date.now(),
        }

        // We could alternatively call the wrapped editor's goToVerse() function,
        // in a callback of setState().
        this.setState({
            chapterUsfmString: chapterUsfm,
            goToVersePropValue: goToVersePropValue,
        })
    }

    /* End UsfmEditor API */

    handleEditorChange = (chapterUsfm: string): void => {
        if (this.props.onChange) {
            this.wholeBookUsfm = getUpdatedWholeBookUsfm(
                chapterUsfm,
                this.wholeBookUsfm
            )
            this.props.onChange(this.wholeBookUsfm)
        }
    }

    componentDidMount(): void {
        if (this.props.goToVerse) {
            this.goToVerse(this.props.goToVerse)
        }
    }

    componentDidUpdate(prevProps: UsfmEditorProps): void {
        if (
            !isEqual(prevProps.goToVerse, this.props.goToVerse) &&
            this.props.goToVerse
        ) {
            this.goToVerse(this.props.goToVerse)
        }
    }

    render(): JSX.Element {
        return (
            <this.props.wrappedEditor
                {...this.props}
                ref={this.wrappedEditorRef}
                onChange={this.handleEditorChange}
                usfmString={this.state.chapterUsfmString}
                goToVerse={this.state.goToVersePropValue}
                key={this.state.chapterUsfmString}
            />
        )
    }
}

type ChapterEditorState = {
    chapterUsfmString: string
    goToVersePropValue?: Verse
}

function getSingleChapterAndBookHeaders(
    wholeBookUsfm: string,
    chapterNum: number
): string {
    const bookHeaders = getBookHeaders(wholeBookUsfm)
    const allChapters = getChapterUsfmArray(wholeBookUsfm)
    const chapter = allChapters.find((chapUsfm) =>
        chapUsfm.startsWith("\\c " + chapterNum)
    )
    return bookHeaders + chapter
}

function getUpdatedWholeBookUsfm(
    chapterUsfm: string,
    wholeBookUsfm: string
): string {
    const bookHeaders = getBookHeaders(chapterUsfm)
    const thisChapter = chapterUsfm.substring(chapterUsfm.indexOf("\\c")) + "\n"
    const chapterNum = thisChapter.match(/^\\c (\d+)/)?.slice(1)
    const allChapters = getChapterUsfmArray(wholeBookUsfm)
    const thisChapterIdx = allChapters.findIndex((chapUsfm) =>
        chapUsfm.startsWith("\\c " + chapterNum)
    )

    // Replace this chapter's contents in the book usfm
    allChapters.splice(thisChapterIdx, 1, thisChapter)
    return bookHeaders + allChapters.join("")
}

function getBookHeaders(usfm: string): string {
    return usfm.substring(0, usfm.indexOf("\\c"))
}

function getChapterUsfmArray(wholeBookUsfm: string): string[] {
    return wholeBookUsfm
        .split("\\c")
        .map((chapStr) => "\\c" + chapStr)
        .slice(1) // Remove the first element, which is the book headers
}