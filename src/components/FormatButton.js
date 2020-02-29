import * as React from 'react'
import { useSlate } from 'slate-react'
import { Editor, Transforms, Text } from 'slate'
import { Button } from './menuComponents'
import { NodeTypes } from '../utils/NodeTypes'

export const FormatButton = ({ format, text }) => {
  const editor = useSlate()
  return (
    <Button
      reversed
      active={isFormatActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault()
        toggleFormat(editor, format)
      }}
    >
      {text}
    </Button>
  )
}

const toggleFormat = (editor, format) => {
    const isActive = isFormatActive(editor, format)
    if (NodeTypes.isInlineFormattingType(format)) {
        toggleInlineFormat(editor, format, isActive)
    } else {
        toggleBlockFormat(editor, format, isActive)
    }
}

const isFormatActive = (editor, format) => {
    return NodeTypes.isInlineFormattingType(format) ?
        isInlineFormatActive(editor, format) :
        isBlockFormatActive(editor, format)
}

const isInlineFormatActive = (editor, format) => {
    const [match] = Editor.nodes(editor, {
        match: n => n[format] === true,
        mode: 'all',
    })
    return !!match
}

const isBlockFormatActive = (editor, format) => {
    if (editor.selection) {
        const [selectedBlock, selectedBlockPath] = 
            Editor.parent(editor, editor.selection.anchor.path)
        return selectedBlock.type === format
    } else {
        return false
    }
}

const toggleInlineFormat = (editor, format, isActive) => {
    Transforms.setNodes(
        editor,
        { [format]: isActive ? null : true },
        { match: Text.isText, split: true }
    )
}

const toggleBlockFormat = (editor, format) => {
    if (format === NodeTypes.S) {
        editor.insertOrRemoveSectionHeader()
    }
}