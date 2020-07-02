import * as React from "react";
import { useRef, useState, useEffect } from "react";
import { VerseNumberMenu, willVerseMenuDisplay } from "./VerseNumberMenu";
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

function withVerseMenu(VerseNumber, includeVerseAddRemove) {
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

        const [hasMenu, setHasMenu] = useState(false)

        useEffect(() => {
            setHasMenu(
                willVerseMenuDisplay(
                    editor,
                    ref,
                    includeVerseAddRemove
                )
            )
        }, [])

        return (
            <React.Fragment>
                <VerseNumber
                    {...props}
                    style={{ cursor: 
                        hasMenu && !ReactEditor.isReadOnly(editor)
                            ? "pointer" 
                            : "" 
                    }}
                    onMouseDown={show}
                    ref={ref}
                />
                {
                    hasMenu &&
                        <ClickAwayListener onClickAway={hide}>
                            <VerseNumberMenu
                                anchorEl={anchorEl}
                                handleClose={hide}
                                includeVerseAddRemove={includeVerseAddRemove}
                            />
                        </ClickAwayListener>
                }
            </React.Fragment>
        )
    }
}

export const VerseNumberWithVerseMenu = withVerseMenu(VerseNumber, true)