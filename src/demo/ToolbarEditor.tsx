import * as React from "react";
import { cx, css } from "emotion";
import { UsfmMarkers } from "../utils/UsfmMarkers";
import { UsfmEditorRef, ForwardRefUsfmEditor, HocUsfmEditorProps, usfmEditorPropTypes, usfmEditorDefaultProps, Verse } from "../UsfmEditor";
import { NoopUsfmEditor } from "../NoopUsfmEditor";
import { MarkButton } from "../components/menu/MarkButton";
import { BlockButton } from "../components/menu/BlockButton";

export function withToolbar(WrappedEditor: ForwardRefUsfmEditor): ForwardRefUsfmEditor {
    return React.forwardRef<ToolbarEditor, HocUsfmEditorProps>(({ ...props }, ref) =>
        <ToolbarEditor
            {...props}
            wrappedEditor={WrappedEditor}
            ref={ref} // used to access the ToolbarEditor and its API
        />
    )
}

class ToolbarEditor extends React.Component<HocUsfmEditorProps> implements UsfmEditorRef {
    public static propTypes = usfmEditorPropTypes
    public static defaultProps = usfmEditorDefaultProps

    constructor(props: HocUsfmEditorProps) {
        super(props)
    }

    wrappedEditorRef = React.createRef<UsfmEditorRef>()
    wrappedEditorInstance: () => UsfmEditorRef = () => 
        this.wrappedEditorRef.current ?? new NoopUsfmEditor()

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

    render() {
        return (
            <React.Fragment>
                <UsfmToolbar editor={this} />
                <this.props.wrappedEditor {...this.props} ref={this.wrappedEditorRef} />
            </React.Fragment>
        )
    }
}

const UsfmToolbar = ({editor}) => {
    return (
      //@ts-ignore
        <Toolbar>
            <MarkButton mark={UsfmMarkers.SPECIAL_TEXT.nd} text="nd" editor={editor} />
            <MarkButton mark={UsfmMarkers.SPECIAL_TEXT.bk} text="bk" editor={editor} />
            <BlockButton marker={UsfmMarkers.TITLES_HEADINGS_LABELS.s} text="S" editor={editor} /> 
        </Toolbar>
    )
}

//@ts-ignore
const Toolbar = React.forwardRef(({ className, ...props }, ref) => (
    <Menu
      {...props}
      ref={ref}
      //@ts-ignore
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
  ))

  //@ts-ignore
  export const Menu = React.forwardRef(({ className, ...props }, ref) => (
    <div
      {...props}
      //@ts-ignore
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
  ))