import * as React from 'react'
import { Button } from './menuComponents'
import { UsfmMarkers }from '../../utils/UsfmMarkers'
import { UsfmEditorRef } from '../../UsfmEditor'

export const BlockButton: React.FC<BlockButtonProps> = ({ marker, text, editor }) => {
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

interface BlockButtonProps {
    marker: string,
    text: string,
    editor: UsfmEditorRef
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