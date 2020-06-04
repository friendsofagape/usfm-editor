
import * as React from 'react'
import { useRef, useEffect } from 'react'
import { useSlate } from 'slate-react'
import { css } from 'emotion'

import { Menu, Portal } from './menu/menuComponents'
import { Button } from './menu/menuComponents'
import { MyTransforms } from '../plugins/helpers/MyTransforms'

export const VerseNumberMenu = ({
    verseNumberRef, 
    verseNumberString
}) => {
  const ref = useRef()
  const editor = useSlate()
  const [startOfVerseRange, endOfVerseRange] = verseNumberString.split('-')
  const isVerseRange = verseNumberString.includes('-')

  useEffect(() => {
    const el = ref.current

    if (!el) {
      return
    }

    // Do not show the verse menu if there are no available actions
    if (
        startOfVerseRange == 1 &&
        !isVerseRange
    ) {
      el.removeAttribute('style')
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
          {
              startOfVerseRange > 1
                ? <JoinWithPreviousVerseButton
                    editor={editor}         
                    verseNumberString={verseNumberString} 
                />
                : null
          }
          {
              isVerseRange
                ? <UnjoinVerseRangeButton
                    editor={editor}         
                    verseNumberString={verseNumberString} 
                />
                : null
          }
      </Menu>
    </Portal>
  )
}

const JoinWithPreviousVerseButton = ({
    editor,
    verseNumberString
}) => {
    return (
        <Button
            active={true}
            onMouseDown={event => {
                MyTransforms.joinWithPreviousVerse(editor, verseNumberString)
            }}
        >
            Merge with previous verse
        </Button>
    )
}

const UnjoinVerseRangeButton = ({
    editor,
    verseNumberString
}) => {
    return (
        <Button
            active={true}
            onMouseDown={event => {
                MyTransforms.unjoinVerses(editor, verseNumberString)
            }}
        >
            Unjoin verses
        </Button>
    )
}