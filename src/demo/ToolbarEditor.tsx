import * as React from "react"
import { cx, css } from "emotion"
import { UsfmMarkers } from "../utils/UsfmMarkers"
import {
    UsfmEditorRef,
    ForwardRefUsfmEditor,
    HocUsfmEditorProps,
    usfmEditorPropTypes,
    usfmEditorDefaultProps,
    Verse,
} from "../UsfmEditor"
import { NoopUsfmEditor } from "../NoopUsfmEditor"
import { MarkButton } from "../components/menu/MarkButton"
import { BlockButton } from "../components/menu/BlockButton"
import { UsfmEditorProps } from ".."

export function withToolbar<W extends UsfmEditorRef>(
    WrappedEditor: ForwardRefUsfmEditor<W>
): ForwardRefUsfmEditor<ToolbarEditor<W>> {
    const fc = React.forwardRef<ToolbarEditor<W>, UsfmEditorProps>(
        ({ ...props }, ref) => (
            <ToolbarEditor
                {...props}
                wrappedEditor={WrappedEditor}
                ref={ref} // used to access the ToolbarEditor and its API
            />
        )
    )
    fc.displayName = (WrappedEditor.displayName ?? "") + "WithToolbar"
    return fc
}

class ToolbarEditor<W extends UsfmEditorRef>
    extends React.Component<HocUsfmEditorProps<W>>
    implements UsfmEditorRef {
    public static propTypes = usfmEditorPropTypes
    public static defaultProps = usfmEditorDefaultProps

    constructor(props: HocUsfmEditorProps<W>) {
        super(props)
    }

    wrappedEditorRef = React.createRef<W>()
    wrappedEditorInstance: () => UsfmEditorRef = () =>
        this.wrappedEditorRef.current ?? new NoopUsfmEditor()

    getMarksAtCursor = () => this.wrappedEditorInstance().getMarksAtCursor()

    addMarkAtCursor = (mark: string) =>
        this.wrappedEditorInstance().addMarkAtCursor(mark)

    removeMarkAtCursor = (mark: string) =>
        this.wrappedEditorInstance().removeMarkAtCursor(mark)

    getParagraphTypesAtCursor = () =>
        this.wrappedEditorInstance().getParagraphTypesAtCursor()

    setParagraphTypeAtCursor = (marker: string) =>
        this.wrappedEditorInstance().setParagraphTypeAtCursor(marker)

    goToVerse = (verse: Verse) => this.wrappedEditorInstance().goToVerse(verse)

    render() {
        return (
            <React.Fragment>
                <UsfmToolbar editor={this} />
                <this.props.wrappedEditor
                    {...this.props}
                    ref={this.wrappedEditorRef}
                />
            </React.Fragment>
        )
    }
}

type UsfmToolbarProps = {
    className?: string
    editor: UsfmEditorRef
}

const UsfmToolbar: React.FC<UsfmToolbarProps> = ({
    editor,
    className,
}: UsfmToolbarProps) => {
    return (
        <Toolbar className={className}>
            <MarkButton
                mark={UsfmMarkers.SPECIAL_TEXT.nd}
                text="nd"
                editor={editor}
            />
            <MarkButton
                mark={UsfmMarkers.SPECIAL_TEXT.bk}
                text="bk"
                editor={editor}
            />
            <BlockButton
                marker={UsfmMarkers.TITLES_HEADINGS_LABELS.s}
                text="S"
                editor={editor}
            />
        </Toolbar>
    )
}
UsfmToolbar.defaultProps = { className: "" }

type ToolbarProps = {
    className?: string
    children: JSX.Element[]
}

const Toolbar = React.forwardRef(
    ({ className, ...props }: ToolbarProps, ref: React.Ref<HTMLDivElement>) => (
        <Menu
            {...props}
            ref={ref}
            className={cx(
                className,
                css`
                    position: relative;
                    padding: 1px 18px 17px;
                    margin: 0 -20px;
                    border-bottom: 2px solid #eee;
                    margin-bottom: 20px;
                    background-color: blue;
                `
            )}
        />
    )
)
Toolbar.displayName = "Toolbar"

type MenuProps = {
    className: string
}

export const Menu = React.forwardRef(
    ({ className, ...props }: MenuProps, ref: React.Ref<HTMLDivElement>) => (
        <div
            {...props}
            ref={ref}
            className={cx(
                className,
                css`
                    & > * {
                        display: inline-block;
                    }
                    & > * + * {
                        margin-left: 15px;
                    }
                `
            )}
        />
    )
)
Menu.displayName = "Menu"
