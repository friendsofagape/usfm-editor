import { FC, Component, createContext } from "react"
import * as PropTypes from "prop-types"
import { MenuProps } from "@material-ui/core"

// Default component implementations
import { BasicMenu } from './defaultComponents/BasicMenu'
import { JoinWithPreviousVerseButton } from './defaultComponents/verseMenuButtons'
import { UnjoinVerseRangeButton } from './defaultComponents/verseMenuButtons'
import { AddVerseButton } from './defaultComponents/verseMenuButtons'
import { RemoveVerseButton } from './defaultComponents/verseMenuButtons'

export interface HasHandleClick {
    handleClick: () => void
}

export interface VerseMenuProps {
    anchorEl: MenuProps['anchorEl']
    handleClose: () => void
}

type Comp<T> = Component<T> | FC<T>

interface UIComponents {
    VerseMenu: Comp<VerseMenuProps>,
    JoinWithPreviousVerseButton: Comp<HasHandleClick>,
    UnjoinVerseRangeButton: Comp<HasHandleClick>,
    AddVerseButton: Comp<HasHandleClick>,
    RemoveVerseButton: Comp<HasHandleClick>
}

// User must invoke this method with any components they wish to supply
// instead of the default components.
// The resulting context should be passed as a prop to the UsfmEditor.
export function buildUIComponentContext(
    userDefined: Partial<UIComponents>
): UIComponents {
    return {
        VerseMenu: addVerseMenuPropTypes(
            userDefined.VerseMenu || BasicMenu
        ),
        JoinWithPreviousVerseButton: addHandleClickPropType(
            userDefined.JoinWithPreviousVerseButton || JoinWithPreviousVerseButton
        ),
        UnjoinVerseRangeButton: addHandleClickPropType(
            userDefined.UnjoinVerseRangeButton || UnjoinVerseRangeButton,
        ),
        AddVerseButton: addHandleClickPropType(
            userDefined.AddVerseButton || AddVerseButton,
        ),
        RemoveVerseButton: addHandleClickPropType(
            userDefined.RemoveVerseButton || RemoveVerseButton
        )
    }
}

function addVerseMenuPropTypes(
    VerseMenu: Comp<VerseMenuProps>
): Comp<VerseMenuProps> {
    //@ts-ignore
    VerseMenu.propTypes = {
        anchorEl: PropTypes.oneOfType([
                PropTypes.instanceOf(Element),
                PropTypes.func
            ]).isRequired,
        handleClose: PropTypes.func.isRequired
    }
    return VerseMenu
}

function addHandleClickPropType(
    VerseMenuButton: Comp<HasHandleClick>
): Comp<HasHandleClick> {
    //@ts-ignore
    VerseMenuButton.propTypes = {
        handleClick: PropTypes.func.isRequired
    }
    return VerseMenuButton
}

export const UIComponentContext = createContext(buildUIComponentContext({}))