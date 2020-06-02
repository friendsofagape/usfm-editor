import * as React from "react";
import { useRef, useState } from "react";
import { VerseNumberMenu } from "./VerseNumberMenu";
import { useInsideOutsideClickListener } from "../plugins/hooks/clickListeners";
import { numberClassNames } from '../transforms/usfmRenderer';

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
        const [verseMenuActive, setVerseMenuActive] = useState(false)
        const onClickInside = () => setVerseMenuActive(!verseMenuActive)
        const onClickOutside = () => setVerseMenuActive(false)
        useInsideOutsideClickListener(ref, onClickInside, onClickOutside)
        return (
            <span>
                <VerseNumber 
                    {...props} 
                    style={{cursor: "pointer"}} 
                    ref={ref} 
                />
                {
                    verseMenuActive ?
                        <VerseNumberMenu verseNumberRef={ref} />
                        : null
                }
            </span>
        )
    }
}

export const VerseNumberWithVerseMenu = withVerseMenu(VerseNumber)