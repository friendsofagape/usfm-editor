import * as React from "react"
import { UsfmEditorRef } from "../.."
import { Button } from "./menuComponents"

export const MarkButton: React.FC<MarkButtonProps> = ({
    mark,
    text,
    editor,
}: MarkButtonProps) => {
    return (
        <Button
            active={isMarkActive(editor, mark)}
            onMouseDown={(event) => {
                event.preventDefault()
                toggleMark(editor, mark)
            }}
        >
            {text}
        </Button>
    )
}

interface MarkButtonProps extends React.HTMLProps<"button"> {
    mark: string
    text: string
    editor: UsfmEditorRef
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
