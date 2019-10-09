import React from "react";
import ReactDOM from 'react-dom'
import { css } from 'emotion'
import { Button, Menu } from './menuComponents'

const SectionHeadButton = ({ editor }) => {
    return (
      <Button
        onMouseDown={event => {
          console.log("Section head button clicked")
          editor.insertInline({
            "object": "inline",
            "type": "s3",
            "data": {},
            "nodes": [
              {
                "data": {},
                "object": "inline",
                type: "contentWrapper",
                nodes: [
                  {
                    "object": "text",
                    text: editor.value.fragment.text,
                    "marks": [] 
                  }
                ]
              }
            ]
          })
        }}
      >
        Section
      </Button>
    )
  }
  
  export const HoverMenu = React.forwardRef(({ editor }, ref) => {
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
        <SectionHeadButton editor={editor} />
      </Menu>,
      root
    )
  })

  