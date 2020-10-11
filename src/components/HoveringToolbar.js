
import * as React from 'react'
import { useRef, useEffect } from 'react'
import { ReactEditor, useSlate } from 'slate-react'
import { Editor, Range } from 'slate'
import { css } from 'emotion'
import { Menu, Portal } from './menu/menuComponents'
import { MyEditor } from '../plugins/helpers/MyEditor'
import { UsfmMarkers } from '../utils/UsfmMarkers'
import { MarkButton } from './menu/MarkButton'
import { BlockButton } from './menu/BlockButton'

export const HoveringToolbar = ({ usfmEditor }) => {
  const ref = useRef()
  const slateEditor = useSlate()

  useEffect(() => {
    const el = ref.current
    const { selection } = slateEditor

    if (!el) {
      return
    }

    if (
      !selection ||
      !ReactEditor.isFocused(slateEditor) ||
      Range.isCollapsed(selection) ||
      Editor.string(slateEditor, selection) === ''
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
        {MyEditor.areMultipleBlocksSelected(slateEditor) 
          ? null
          : <BlockButton marker={UsfmMarkers.TITLES_HEADINGS_LABELS.s} text="S" editor={usfmEditor} /> 
        }
        <MarkButton mark={UsfmMarkers.SPECIAL_TEXT.bk} text="bk" editor={usfmEditor} />
        <MarkButton mark={UsfmMarkers.SPECIAL_TEXT.nd} text="nd" editor={usfmEditor} />
      </Menu>
    </Portal>
  )
}