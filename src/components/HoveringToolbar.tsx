import * as React from "react"
import { useRef, useEffect } from "react"
import { ReactEditor, useSlate } from "slate-react"
import { Editor, Range } from "slate"
import { css } from "emotion"
import { UsfmEditorRef } from "../UsfmEditor"
import { Menu, Portal } from "./menu/menuComponents"
import { MyEditor } from "../plugins/helpers/MyEditor"
import { UsfmMarkers } from "../utils/UsfmMarkers"
import { MarkButton } from "./menu/MarkButton"
import { BlockButton } from "./menu/BlockButton"

type HoveringToolbarProps = {
    usfmEditor: UsfmEditorRef
}

export const HoveringToolbar: React.FC<HoveringToolbarProps> = ({
    usfmEditor,
}: HoveringToolbarProps) => {
    const ref = useRef<HTMLDivElement>(null)
    const slateEditor = useSlate()

    useEffect(() => {
        const el = ref.current
        const { selection } = slateEditor

        if (!el) {
            return
        }

        if (
            !selection ||
            !ReactEditor.isFocused(slateEditor) ||
            Range.isCollapsed(selection) ||
            Editor.string(slateEditor, selection) === ""
        ) {
            el.removeAttribute("style")
            return
        }

        const selectionRect = window
            .getSelection()
            ?.getRangeAt(0)
            ?.getBoundingClientRect()
        if (selectionRect) {
            const top = selectionRect.top + window.pageYOffset - el.offsetHeight
            const left =
                selectionRect.left +
                window.pageXOffset -
                el.offsetWidth / 2 +
                selectionRect.width / 2
            el.style.opacity = "1"
            el.style.top = `${top}px`
            el.style.left = `${left}px`
        }
    })

    return (
        <Portal>
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
                {MyEditor.areMultipleBlocksSelected(slateEditor) ? null : (
                    <BlockButton
                        marker={UsfmMarkers.TITLES_HEADINGS_LABELS.s}
                        text="S"
                        editor={usfmEditor}
                    />
                )}
                <MarkButton
                    mark={UsfmMarkers.SPECIAL_TEXT.bk}
                    text="bk"
                    editor={usfmEditor}
                />
                <MarkButton
                    mark={UsfmMarkers.SPECIAL_TEXT.nd}
                    text="nd"
                    editor={usfmEditor}
                />
            </Menu>
        </Portal>
    )
}
