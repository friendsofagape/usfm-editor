import * as React from "react";
import { useRef, useState, useEffect, useContext, useMemo, forwardRef } from "react";
import { VerseNumberMenu, willVerseMenuDisplay } from "./VerseNumberMenu";
import { numberClassNames } from '../transforms/usfmRenderer';
import { useSlate, ReactEditor } from 'slate-react'
import { OptionsContext } from "../OptionsContext";
import { Transforms } from "slate";

export const VerseNumber = forwardRef(
    ({ ...props }, ref) => (
        <sup
            {...props}
            ref={ref}
            contentEditable={false}
            className={`usfm-marker-v ${numberClassNames(props.element)}`}
        >
            {props.children}
        </sup>
    )
)

function withVerseMenu(VerseNumber) {
    return function (props) {
        const { useVerseAddRemove } = useContext(OptionsContext)
        const verseNumberRef = useRef(null)
        const editor = useSlate()
        const [open, setOpen] = useState(false)
        if (ReactEditor.isReadOnly(editor) &&
            open
        ) {
            setOpen(false)
        }

        const handleToggle = useMemo(() => 
            (event) => {
                if (ReactEditor.isReadOnly(editor)) return
                if (!open) {
                    // The menu is about to be opened.
                    // Do not allow a selection to be made adjacent to the verse number.
                    event.preventDefault()
                    // Selection should be null when the verse menu opens.
                    Transforms.deselect(editor)
                }
                setOpen(!open);
        }, [])

        const [hasMenu, setHasMenu] = useState(false)

        // When the verse number is mounted, calculate whether the menu will have
        // available actions. When a verse transformation occurs that involves this verse,
        // "hasMenu" must be updated. We rely upon the verse transformation functions to 
        // replace the verse number node (not just its text) to trigger this effect. 
        useEffect(() => {
            setHasMenu(
                willVerseMenuDisplay(
                    editor,
                    verseNumberRef.current,
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
                    // We will use event.preventDefault() to stop the editor from
                    // selecting an adjacent text node even though the verse number
                    // was clicked. Since selections are set "on mouse down", we need
                    // to use "onMouseDown" here. 
                    onMouseDown={handleToggle}
                    ref={verseNumberRef}
                />
                {
                    hasMenu &&
                        <VerseNumberMenu
                            verseNumberEl={verseNumberRef.current}
                            open={open}
                            handleClose={() => setOpen(false)}
                            useVerseAddRemove={useVerseAddRemove}
                        />
                }
            </React.Fragment>
        )
    }
}

export const VerseNumberWithVerseMenu = withVerseMenu(VerseNumber)