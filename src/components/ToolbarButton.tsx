import * as React from "react"
import { Button, Icon, Tooltip } from "@material-ui/core"
import { UsfmEditorRef } from ".."
import { ActionSpec, ToolbarButtonSpec } from "./UsfmToolbar"
import { UsfmMarkers } from "../utils/UsfmMarkers"

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
    editor,
    buttonSpec,
    buttonLabel,
}: ToolbarButtonProps) => {
    const { icon, cssClass, actionSpec } = buttonSpec
    return (
        <Tooltip title={buttonLabel} enterDelay={500}>
            <Button
                disableRipple
                disableFocusRipple
                aria-label={buttonLabel.toLowerCase()}
                disabled={isDisabled(actionSpec, editor)}
                onMouseDown={(event: React.MouseEvent) =>
                    onClick(event, actionSpec, editor)
                }
                className={`usfm-editor-toolbar-button usfm-editor-toolbar-button-${
                    isActive(actionSpec, editor) ? "active" : "inactive"
                } ${cssClass}`.trim()}
            >
                {typeof icon == "string" ? (
                    icon
                ) : (
                    <Icon
                        component={icon}
                        className="usfm-editor-toolbar-icon"
                    />
                )}
            </Button>
        </Tooltip>
    )
}

interface ToolbarButtonProps {
    editor: UsfmEditorRef
    buttonSpec: ToolbarButtonSpec
    buttonLabel: string
}

const isDisabled = (actionSpec: ActionSpec, editor: UsfmEditorRef): boolean => {
    if (!editor || !actionSpec) {
        return true
    }
    return (
        actionSpec.buttonType == "ParagraphButton" &&
        editor.getParagraphTypesAtSelection().length > 1
    )
}

const isActive = (actionSpec: ActionSpec, editor: UsfmEditorRef): boolean => {
    if (!editor || !actionSpec) {
        return false
    }
    switch (actionSpec.buttonType) {
        case "ActionButton":
            return actionSpec.isActive(editor)
        case "MarkButton":
            return isMarkActive(editor, actionSpec.usfmMarker)
        case "ParagraphButton":
            return isBlockActive(editor, actionSpec.usfmMarker)
    }
}

const onClick = (
    event: React.MouseEvent,
    actionSpec: ActionSpec,
    editor: UsfmEditorRef
) => {
    event.preventDefault()
    switch (actionSpec.buttonType) {
        case "ActionButton":
            actionSpec.action(editor)
            return
        case "MarkButton":
            toggleMarkAtCursor(editor, actionSpec.usfmMarker)
            if (actionSpec.additionalAction) actionSpec.additionalAction(editor)
            return
        case "ParagraphButton":
            toggleParagraphTypeAtCursor(editor, actionSpec.usfmMarker)
            if (actionSpec.additionalAction) actionSpec.additionalAction(editor)
            return
    }
}

const toggleMarkAtCursor = (editor: UsfmEditorRef, mark: string) => {
    const isActive = isMarkActive(editor, mark)
    if (isActive) {
        editor.removeMarkAtSelection(mark)
    } else {
        editor.addMarkAtSelection(mark)
    }
}

const toggleParagraphTypeAtCursor = (editor: UsfmEditorRef, marker: string) => {
    const isActive = isBlockActive(editor, marker)
    if (isActive) {
        editor.setParagraphTypeAtSelection(UsfmMarkers.PARAGRAPHS.p)
    } else {
        editor.setParagraphTypeAtSelection(marker)
    }
}

const isMarkActive = (editor: UsfmEditorRef, mark: string) => {
    const marks = editor.getMarksAtSelection()
    return marks.includes(mark)
}

const isBlockActive = (editor: UsfmEditorRef, marker: string) => {
    const types = editor.getParagraphTypesAtSelection()
    return types.includes(marker)
}
