import * as React from "react";
import { useRef, useState } from "react";
import { VerseNumberMenu } from "./VerseNumberMenu";
import { numberClassNames } from '../transforms/usfmRenderer';
import { useSlate, ReactEditor } from 'slate-react'
import { ClickAwayListener } from "@material-ui/core";

export const VerseNumber = React.forwardRef(
    ({ ...props }, ref) => (
        <sup
            {...props}
            ref={ref}
            contentEditable={false}
            className={`VerseNumber ${numberClassNames(props.element)}`}
        >
            {props.children}
        </sup>
    )
)

function withVerseMenu(VerseNumber) {
    return function (props) {
        const ref = useRef(null)
        const [anchorEl, setAnchorEl] = useState(null);
        const editor = useSlate()

        const show = (event) => {
            if (ReactEditor.isReadOnly(editor)) return
            setAnchorEl(event.target)
        }

        const hide = (event) => {
            setAnchorEl(null)
            ReactEditor.focus(editor)
        }

        return (
            <React.Fragment>
                <VerseNumber
                    {...props}
                    style={{ cursor: "pointer" }}
                    onMouseDown={show}
                    ref={ref}
                />
                <ClickAwayListener onClickAway={hide}>
                    <VerseNumberMenu
                        anchorEl={anchorEl}
                        handleClose={hide}
                    />
                </ClickAwayListener>
            </React.Fragment>
        )
    }
}

export const VerseNumberWithVerseMenu = withVerseMenu(VerseNumber)