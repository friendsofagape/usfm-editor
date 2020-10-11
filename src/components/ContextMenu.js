import * as React from 'react'
import { useRef, useEffect } from 'react'
import { Menu, Portal } from './menu/menuComponents'
import { PropTypes } from "prop-types" 

export const ContextMenu = (props) => {
  const ref = useRef()

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }
    setLocation(el, props.contextRef)
  })

  function setLocation(el, contextRef) {
    const rect = contextRef.current.getBoundingClientRect()
    el.style.opacity = 1
    el.style.top = `${rect.top + window.pageYOffset + el.offsetHeight}px`
    el.style.left = `${rect.left +
      window.pageXOffset -
      el.offsetWidth / 2 +
      rect.width / 2}px`
  }

  return (
    <Portal>
      <Menu
        ref={ref}
        className={"usfm-editor-context-menu"}
      >
        {props.children}
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
