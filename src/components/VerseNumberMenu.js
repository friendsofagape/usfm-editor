import * as React from 'react'
import { useRef, useEffect } from 'react'
import { useSlate } from 'slate-react'
import { css } from 'emotion'
import { Menu, Portal } from './menu/menuComponents'
import { Button } from './menu/menuComponents'
import { MyTransforms } from '../plugins/helpers/MyTransforms'
import { MyEditor } from '../plugins/helpers/MyEditor'
import { PropTypes } from "prop-types" 

export const VerseNumberMenu = ({
    verseNumberRef,
    verseNumberString
}) => {
    return (
        <ContextMenu
            contextRef={verseNumberRef}
        >
            <VerseJoinUnjoinMenuFragment
                verseNumberString={verseNumberString}
            />
            <VerseAddRemoveMenuFragment
                verseNumberString={verseNumberString}
            />
        </ContextMenu>
    )
}

const VerseJoinUnjoinMenuFragment = ({
    verseNumberString
}) => {
    const editor = useSlate()
    const [startOfVerseRange, endOfVerseRange] = verseNumberString.split('-')
    const isVerseRange = verseNumberString.includes('-')
    return (
        <React.Fragment>
            {
                startOfVerseRange > 1
                ? <JoinWithPreviousVerseButton editor={editor} />
                : null
            }
            {
                isVerseRange
                ? <UnjoinVerseRangeButton editor={editor} />
                : null
            }
        </React.Fragment>
    )
}

const VerseAddRemoveMenuFragment = ({
    verseNumberString
}) => {
    const editor = useSlate()
    const isLastVerse = MyEditor.getLastVerseNumberOrRange(editor) == verseNumberString
    return (
        <React.Fragment>
            {
                isLastVerse
                ? <RemoveVerseButton editor={editor} />
                : null
            }
            {
                isLastVerse
                ? <AddVerseButton editor={editor} />
                : null
            }
        </React.Fragment>
    )
}

export const ContextMenu = (props) => {
  const ref = useRef()

  useEffect(() => {
    const el = ref.current

    if (!el) {
      return
    }

    // Do not show the verse menu if there are no available actions
    if (props.children.length == 0) {
      el.removeAttribute('style')
      return
    }

    const rect = props.contextRef.current.getBoundingClientRect()
    // const rect = contextRef.current.getBoundingClientRect()
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
        {...props.children}
      </Menu>
    </Portal>
  )
}

ContextMenu.propTypes = {
    contextRef: PropTypes.oneOfType([
        PropTypes.func, 
        PropTypes.shape({ current: PropTypes.any })
    ]).isRequired
}

const JoinWithPreviousVerseButton = ({ editor }) => {
    return (
        <Button
            active={true}
            onMouseDown={event => {
                MyTransforms.joinWithPreviousVerse(editor)
            }}
        >
            Merge with previous verse
        </Button>
    )
}

const UnjoinVerseRangeButton = ({ editor }) => {
    return (
        <Button
            active={true}
            onMouseDown={event => {
                MyTransforms.unjoinVerses(editor)
            }}
        >
            Unjoin verses
        </Button>
    )
}

const AddVerseButton = ({ editor }) => {
    return (
        <Button
            active={true}
            onMouseDown={event => {
                MyTransforms.addVerse(editor)
            }}
        >
            Add verse
        </Button>
    )
}

const RemoveVerseButton = ({ editor }) => {
    return (
        <Button
            active={true}
            onMouseDown={event => {
                MyTransforms.removeVerseAndConcatenateContentsWithPrevious(editor)
            }}
        >
            Remove verse
        </Button>
    )
}