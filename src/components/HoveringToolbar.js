
import * as React from 'react'
import { useRef, useEffect } from 'react'
import { ReactEditor, useSlate } from 'slate-react'
import { Editor, Range } from 'slate'
import { css } from 'emotion'

import { Menu, Portal } from './menuComponents'
import { NodeTypes } from '../utils/NodeTypes'
import { FormatButton } from './FormatButton'
import { MyEditor } from '../utils/MyEditor'

export const HoveringToolbar = () => {
  const ref = useRef()
  const editor = useSlate()

  useEffect(() => {
    const el = ref.current
    const { selection } = editor

    if (!el) {
      return
    }

    if (
      !selection ||
      !ReactEditor.isFocused(editor) ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ''
    ) {
      el.removeAttribute('style')
      return
    }

    const domSelection = window.getSelection()
    const domRange = domSelection.getRangeAt(0)
    const rect = domRange.getBoundingClientRect()
    el.style.opacity = 1
    el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`
    el.style.left = `${rect.left +
      window.pageXOffset -
      el.offsetWidth / 2 +
      rect.width / 2}px`
  })

  return (
    <Portal>
      <Menu
        ref={ref}
        className={css`
          padding: 8px 7px 6px;
          position: absolute;
          z-index: 1;
          top: -10000px;
          left: -10000px;
          margin-top: -6px;
          opacity: 0;
          background-color: #222;
          border-radius: 4px;
          transition: opacity 0.75s;
        `}
      >
        {MyEditor.areMultipleBlocksSelected(editor) ? 
          null : 
          <FormatButton format={NodeTypes.S} text="S" /> 
        }
        <FormatButton format={NodeTypes.BK} text="bk" />
        <FormatButton format={NodeTypes.ND} text="nd" />
      </Menu>
    </Portal>
  )
}
