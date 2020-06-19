import * as React from "react";
import { useRef, useState } from "react";
import { VerseNumberMenu } from "./VerseNumberMenu";
import { useInsideOutsideClickListener } from "../plugins/hooks/clickListeners";
import { numberClassNames } from '../transforms/usfmRenderer';
import { useSlate, ReactEditor } from 'slate-react'
import { MyTransforms } from "../plugins/helpers/MyTransforms";

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
        const getAnchorEl = () => anchorEl
        const editor = useSlate()
        const onClickInside = (event) => {
            // If the verse number is clicked too far to one side, the editor
            // may select an adjacent text element. We can prevent this by
            // preventing the default action and forcing selection of the text
            // that was clicked (the verse number text.)
            MyTransforms.selectDOMNodeStart(editor, event.target)
            setAnchorEl(
                getAnchorEl() ? null : event.target
            )
        }
        const handleMenuClose = (event) => setAnchorEl(null)
        const disableIf = () => ReactEditor.isReadOnly(editor)
        useInsideOutsideClickListener(
            ref,
            onClickInside,
            // handleMenuClose does the job of the outside click listener
            (event) => { },
            disableIf
        )
        return (
            <React.Fragment>
                <VerseNumber
                    {...props}
                    style={{ cursor: "pointer" }}
                    ref={ref}
                />
                {
                    anchorEl ?
                        <VerseNumberMenu
                            anchorEl={anchorEl}
                            handleClose={handleMenuClose}
                        />
                        : null
                }
            </React.Fragment>
        )
    }
}

export const VerseNumberWithVerseMenu = withVerseMenu(VerseNumber)