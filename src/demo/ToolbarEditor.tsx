import * as React from "react";
import { cx, css } from "emotion";
import { Button } from "../components/menu/menuComponents";
import { UsfmMarkers } from "../utils/UsfmMarkers";
import { UsfmEditorRef, ForwardRefUsfmEditor, HocUsfmEditorProps, usfmEditorPropTypes, usfmEditorDefaultProps } from "../UsfmEditor";
import { NoopUsfmEditor } from "../NoopUsfmEditor";

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

export const MarkButton = ({ mark, text, editor }) => {
    return (
        //@ts-ignore
        <Button
            active={isMarkActive(editor, mark)}
            onMouseDown={event => {
                event.preventDefault()
                toggleMark(editor, mark)
            }}
        >
            {text}
        </Button>
    )
}

const isMarkActive = (editor: UsfmEditorRef, mark: string) => {
    const marks = editor.getMarksAtCursor()
    return marks.includes(mark)
}

const toggleMark = (editor: UsfmEditorRef, mark: string) => {
    const isActive = isMarkActive(editor, mark)
    if (isActive) {
        editor.removeMarkAtCursor(mark)
    } else {
        editor.addMarkAtCursor(mark)
    }
}

export const BlockButton = ({ marker, text, editor }) => {
    return (
        //@ts-ignore
        <Button
            active={isBlockActive(editor, marker)}
            onMouseDown={event => {
                event.preventDefault()
                toggleBlock(editor, marker)
            }}
        >
            {text}
        </Button>
    )
}

const isBlockActive = (editor: UsfmEditorRef, marker: string) => {
    const types = editor.getParagraphTypesAtCursor()
    return types.includes(marker)
}

const toggleBlock = (editor: UsfmEditorRef, marker: string) => {
    const isActive = isBlockActive(editor, marker)
    if (isActive) {
        editor.setParagraphTypeAtCursor(UsfmMarkers.PARAGRAPHS.p)
    } else {
        editor.setParagraphTypeAtCursor(marker)
    }
}