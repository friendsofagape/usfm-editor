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
    implements UsfmEditorRef
{
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
        if (chapterUsfm) {
            this.setState({
                chapterUsfmString: chapterUsfm,
                goToVersePropValue: goToVersePropValue,
            })
        }
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
        this.goToVerse(this.props.goToVerse || ChapterEditor.defaultGoToVerse)
    }

    componentDidUpdate(prevProps: UsfmEditorProps): void {
        if (!isEqual(prevProps.usfmString, this.props.usfmString)) {
            this.wholeBookUsfm = this.props.usfmString
            this.goToVerse(
                this.props.goToVerse || ChapterEditor.defaultGoToVerse
            )
        } else if (
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
): string | undefined {
    const bookHeaders = getBookHeaders(wholeBookUsfm)
    const allChapters = getChapterUsfmArray(wholeBookUsfm)
    const regExp: RegExp = chapterNumRegex(chapterNum)
    const chapter = allChapters.find((chapUsfm) => regExp.test(chapUsfm))
    return chapter ? bookHeaders + chapter : undefined
}

function getUpdatedWholeBookUsfm(
    chapterUsfm: string,
    wholeBookUsfm: string
): string {
    const bookHeaders = getBookHeaders(chapterUsfm)
    const allChapters = getChapterUsfmArray(wholeBookUsfm)
    const thisChapter = chapterUsfm.substring(chapterUsfm.indexOf("\\c")) + "\n"
    const chapterNum = thisChapter.match(/^\\c\s*(\d+)/)?.slice(1)[0]

    if (chapterNum) {
        const regExp: RegExp = chapterNumRegex(parseInt(chapterNum))
        const thisChapterIdx = allChapters.findIndex((chapUsfm) =>
            regExp.test(chapUsfm)
        )

        // Replace this chapter's contents in the book usfm
        allChapters.splice(thisChapterIdx, 1, thisChapter)
    } else {
        console.error(
            "Unexpected state: could not find chapter number in chapter usfm"
        )
    }
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

function chapterNumRegex(chapterNum: number): RegExp {
    return new RegExp("\\c\\s*" + chapterNum + "\\s*")
}
