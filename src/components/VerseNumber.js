import * as React from "react";
import { useRef, useState, useEffect, useContext } from "react";
import { VerseNumberMenu, willVerseMenuDisplay } from "./VerseNumberMenu";
import { numberClassNames } from '../transforms/usfmRenderer';
import { useSlate, ReactEditor } from 'slate-react'
import { ClickAwayListener } from "@material-ui/core";
import { OptionsContext } from "../OptionsContext";

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
        const { useVerseAddRemove } = useContext(OptionsContext)

        const ref = useRef(null)
        const [anchorEl, setAnchorEl] = useState(null);
        const editor = useSlate()

        const show = (event) => {
            if (ReactEditor.isReadOnly(editor)) return
            setAnchorEl(event.target)
        }

        const hide = (event) => setAnchorEl(null)

        const [hasMenu, setHasMenu] = useState(false)

        useEffect(() => {
            setHasMenu(
                willVerseMenuDisplay(
                    editor,
                    ref,
                    useVerseAddRemove
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
                                useVerseAddRemove={useVerseAddRemove}
                            />
                        </ClickAwayListener>
                }
            </React.Fragment>
        )
    }
}

export const VerseNumberWithVerseMenu = withVerseMenu(VerseNumber)