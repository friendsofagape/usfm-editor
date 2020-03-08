import * as React from 'react'
import { Editor, Transforms } from 'slate'
import { useSlate } from 'slate-react'
import { Button } from './menuComponents'
import { NodeTypes } from '../../utils/NodeTypes'
import { MyEditor } from '../../plugins/helpers/MyEditor'
import { MyTransforms } from '../../plugins/helpers/MyTransforms'

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
    const [match] = Editor.nodes(editor, {
        match: n => n.type === format,
    })
    return !!match
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
    if (MyEditor.isNearbyBlockAnEmptyInlineContainer(editor, { direction: 'previous' })) {
        MyTransforms.mergeSelectedBlockAndSetToInlineContainer(
            editor, 
            { mode: 'previous' }
        )
    } else {
        // 'p' (paragraph) is the default block format
        Transforms.setNodes(
            editor, 
            { type: NodeTypes.P },
            { match: n => n.type && n.type === format}
        )
    }
}

function applyFormat(editor, format) {
    Transforms.setNodes(
        editor, 
        { type: format },
        { match: n => n.type && NodeTypes.isVerseContentBlockType(n.type) }
    )
}
  