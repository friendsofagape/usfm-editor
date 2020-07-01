import { FC, Component, createContext } from "react"

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
    anchorEl,
    handleClose: () => void
}

type Comp<T> = Component<T> | FC<T>

interface UIComponents {
    VerseMenu: Comp<VerseMenuProps>
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
        VerseMenu: userDefined.VerseMenu || BasicMenu,
        JoinWithPreviousVerseButton: userDefined.JoinWithPreviousVerseButton || JoinWithPreviousVerseButton,
        UnjoinVerseRangeButton: userDefined.UnjoinVerseRangeButton || UnjoinVerseRangeButton,
        AddVerseButton: userDefined.AddVerseButton || AddVerseButton,
        RemoveVerseButton: userDefined.RemoveVerseButton || RemoveVerseButton
    }
}

export const UIComponentContext = createContext(buildUIComponentContext({}))