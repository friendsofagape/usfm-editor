
import * as React from 'react'
import { useRef, useEffect } from 'react'
import { ReactEditor, useSlate } from 'slate-react'
import { Editor, Range } from 'slate'
import { css } from 'emotion'

import { Menu, Portal } from './menu/menuComponents'
import { NodeTypes } from '../utils/NodeTypes'
import { MarkTypes } from '../utils/MarkTypes'
import { MyEditor } from '../plugins/helpers/MyEditor'
import { BlockButton } from './menu/BlockButton'
import { MarkButton } from './menu/MarkButton'
import { useState } from 'react';

export const VerseNumberMenu = ({verseNumberRef}) => {
  const ref = useRef()

  useEffect(() => {
    const el = ref.current

    if (!el) {
      return
    }

    const rect = verseNumberRef.current.getBoundingClientRect()
    el.style.opacity = 1
    el.style.top = `${rect.top + window.pageYOffset + el.offsetHeight}px`
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
        <MarkButton format={MarkTypes.BK} text="bk" />
        <MarkButton format={MarkTypes.ND} text="nd" />
      </Menu>
    </Portal>
  )
}
