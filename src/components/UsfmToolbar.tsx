import * as React from "react"
import { UsfmEditorRef } from "../UsfmEditor"
import Toolbar from "@material-ui/core/Toolbar"
import { SvgIconTypeMap } from "@material-ui/core"
import { OverridableComponent } from "@material-ui/core/OverridableComponent"
import { ToolbarButton } from "./ToolbarButton"
import { UsfmMarkers } from "../utils/UsfmMarkers"

type UsfmToolbarProps = {
    toolbarSpecs: ToolbarSpecs
    editor: UsfmEditorRef
}

export const UsfmToolbar: React.FC<UsfmToolbarProps> = ({
    toolbarSpecs,
    editor,
}: UsfmToolbarProps) => {
    const specs = toolbarSpecs || defaultToolbarSpecs
    return (
        <Toolbar className="usfm-editor-toolbar usfm-editor-border-bottom">
            {Object.keys(specs).map(function (text) {
                return (
                    <ToolbarButton
                        key={text}
                        buttonSpec={specs[text]}
                        editor={editor}
                        buttonLabel={text}
                    />
                )
            })}
        </Toolbar>
    )
}

/**
 * The button specifications for a Usfm Toolbar are defined using this type.
 * The string key of each record will be used as the label and the tooltip text
 * for the corresponding button.
 */
export type ToolbarSpecs = Record<string, ToolbarButtonSpec>

/**
 * Defines a single toolbar button.
 * The icon is a string or component that can be loaded in one of the following two ways:
 *    import FormatBoldButton from "@material-ui/icons/FormatBold"
 *    import { ReactComponent as CustomIcon } from "<relative path>/custom-icon.svg"
 * If a string is passed for the icon, the button will simply show that text.
 * cssClass allows for custom styling on the button.
 * actionSpec defines the behavior of the button.
 */
export interface ToolbarButtonSpec {
    icon:
        | string
        | OverridableComponent<SvgIconTypeMap<unknown, "svg">>
        | React.FC<React.SVGProps<SVGSVGElement>>
    cssClass?: string
    actionSpec: ActionSpec
}

export type ActionSpec = MarkButtonSpec | ParagraphButtonSpec | ActionButtonSpec

/**
 * Defines a toolbar button that toggles a non-paragraph usfm marker.
 * additionalAction() defines a custom action to be performed after the toggle.
 */
export interface MarkButtonSpec {
    buttonType: "MarkButton"
    usfmMarker: string
    additionalAction?: (editor: UsfmEditorRef) => void
}

/**
 * Defines a toolbar button that toggles a paragraph usfm marker.
 * additionalAction() defines a custom action to be performed after the toggle.
 */
export interface ParagraphButtonSpec {
    buttonType: "ParagraphButton"
    usfmMarker: string
    additionalAction?: (editor: UsfmEditorRef) => void
}

/**
 * Defines a toolbar button with a custom isActive() and action() function.
 * isActive() is used for styling purposes, not the enabled/disabled state.
 */
export interface ActionButtonSpec {
    buttonType: "ActionButton"
    isActive: (editor: UsfmEditorRef) => boolean
    action: (editor: UsfmEditorRef) => void
}

export const defaultToolbarSpecs: ToolbarSpecs = {
    "Section Header": {
        icon: "S",
        cssClass: "s-toolbar-button",
        actionSpec: {
            buttonType: "ParagraphButton",
            usfmMarker: UsfmMarkers.TITLES_HEADINGS_LABELS.s,
        },
    },
    "Quoted Book Title": {
        icon: "BK",
        cssClass: "bk-toolbar-button",
        actionSpec: {
            buttonType: "MarkButton",
            usfmMarker: UsfmMarkers.SPECIAL_TEXT.bk,
        },
    },
    "Nomen Domini": {
        icon: "ND",
        cssClass: "nd-toolbar-button",
        actionSpec: {
            buttonType: "MarkButton",
            usfmMarker: UsfmMarkers.SPECIAL_TEXT.nd,
        },
    },
}
