import * as React from 'react'
import { Editor, Transforms } from 'slate'
import { useSlate } from 'slate-react'
import { Button } from './menuComponents'
import { MyEditor } from '../../plugins/helpers/MyEditor'
import { MyTransforms } from '../../plugins/helpers/MyTransforms'
import { UsfmMarkers }from '../../utils/UsfmMarkers'
import NodeRules from '../../utils/NodeRules'

export const BlockButton = ({ format, text }) => {
    const editor = useSlate()
    return (
        <Button
            active={isBlockActive(editor, format)}
            onMouseDown={event => {
                event.preventDefault()
                toggleBlock(editor, format)
            }}
        >
            {text}
        </Button>
    )
}

const isBlockActive = (editor, format) => {
    return MyEditor.isMatchingNodeSelected(
        editor,
        n => n.type === format,
    )
}

const toggleBlock = (editor, format) => {
    const isActive = isBlockActive(editor, format)
    if (isActive) {
        resetBlockToDefault(editor, format)
    } else {
        applyFormat(editor, format)
    }
}

function resetBlockToDefault(editor, format) {
    if (MyEditor.isNearbyBlockAnEmptyInlineContainer(editor, 'previous')) {
        MyTransforms.mergeSelectedBlockAndSetToInlineContainer(
            editor,
            { mode: 'previous' }
        )
    } else {
        // 'p' (paragraph) is the default block format
        Transforms.setNodes(
            editor,
            { type: UsfmMarkers.PARAGRAPHS.p },
            { match: n => n.type === format }
        )
    }
}

function applyFormat(editor, format) {
    Transforms.setNodes(
        editor,
        { type: format },
        { match: n => NodeRules.isFormattableBlockType(n.type) }
    )
}