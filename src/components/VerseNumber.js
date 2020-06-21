import * as React from "react";
import { useRef, useState } from "react";
import { VerseNumberMenu } from "./verseNumberMenu/VerseNumberMenu";
import { numberClassNames } from '../transforms/usfmRenderer';
import { useSlate, ReactEditor } from 'slate-react'
import { MyTransforms } from "../plugins/helpers/MyTransforms";
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
            // If the verse number is clicked too far to one side, the editor
            // may select an adjacent text element. We can prevent this by
            // preventing the default action and forcing selection of the text
            // that was clicked (the verse number text.)
            MyTransforms.selectDOMNodeStart(editor, event.target)
            setAnchorEl(event.target)
        }

        const hide = (event) => setAnchorEl(null)

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