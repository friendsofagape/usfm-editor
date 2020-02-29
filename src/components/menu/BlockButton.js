import * as React from 'react'
import { Editor } from 'slate'
import { useSlate } from 'slate-react'
import { Button } from './menuComponents'
import { NodeTypes } from '../../utils/NodeTypes'

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
    if (format === NodeTypes.S) {
        editor.insertOrRemoveSectionHeader()
    }
}
  