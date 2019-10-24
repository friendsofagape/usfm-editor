import React from "react";
import ReactDOM from 'react-dom'
import { css } from 'emotion'
import { Button, Menu } from './menuComponents'

export const HoverMenu = React.forwardRef(({ editor, sourceMap }, ref) => {
  const root = window.document.getElementById('rsg-root')

  return ReactDOM.createPortal(
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
      <Button 
        onMouseDown={function(){editor.createSectionHeader(sourceMap)}}
      > Section 
      </Button>

    </Menu>,
    root
  )
})