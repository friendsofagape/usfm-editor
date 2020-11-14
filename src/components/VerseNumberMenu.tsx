import * as React from 'react'
import { Node, Path } from "slate"
import { useSlate, ReactEditor } from 'slate-react'
import { MyTransforms } from '../plugins/helpers/MyTransforms'
import { MyEditor } from '../plugins/helpers/MyEditor'
import PropTypes from "prop-types"
import { UIComponentContext } from "../injectedUI/UIComponentContext"
import Popper from '@material-ui/core/Popper'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'

type VerseNumberMenuProps = {
    verseNumberEl: HTMLElement,
    open: boolean,
    handleClose: (event: React.MouseEvent<Document>) => void,
    useVerseAddRemove: boolean,
}

export const VerseNumberMenu: React.FC<VerseNumberMenuProps> = ({
    verseNumberEl,
    open,
    handleClose,
    useVerseAddRemove
}: VerseNumberMenuProps) => {
    if (!verseNumberEl) return null

    const { VerseMenu } = React.useContext(UIComponentContext)
    const editor = useSlate()
    // This will find the verse path. We need the verse number path, so concatenate a zero.
    const verseNumberPath = MyEditor.getPathFromDOMNode(editor, verseNumberEl)
        .concat(0)

    return (
        <Popper 
            anchorEl={verseNumberEl}
            open={open}
            modifiers={{
                flip: { enabled: true }
            }}>
            <ClickAwayListener 
                // If "onClick" is used instead of "onMouseDown", multiple menus may be
                // displayed simultaneously. Additionally, if the verse number displays uses
                // "onClick" to display the menu rather than "onMouseDown', this 
                // ClickAwayListener will not work.
                mouseEvent={"onMouseDown"}
                onClickAway={handleClose}>
                <VerseMenu>
                    <VerseJoinUnjoinSubmenu
                        editor={editor}
                        verseNumberPath={verseNumberPath}
                    />
                    {
                        useVerseAddRemove &&
                            <VerseAddRemoveSubmenu
                                editor={editor}
                                verseNumberPath={verseNumberPath}
                            />
                    }
                </VerseMenu>
            </ClickAwayListener>
        </Popper>
    )
}

export function willVerseMenuDisplay(
    editor: ReactEditor,
    verseNumberEl: HTMLElement,
    useVerseAddRemove: boolean
): boolean {
    // This will find the verse path. We need the verse number path, so concatenate a zero.
    const verseNumberPath = MyEditor.getPathFromDOMNode(editor, verseNumberEl)
        .concat(0)
    const [verseNumberNode] = MyEditor.node(editor, verseNumberPath)
    const verseNumberString = Node.string(verseNumberNode)

    const isVerseRange = verseNumberString.includes('-')
    const isLastVerse = verseNumberString == 
        MyEditor.getLastVerseNumberOrRange(editor, verseNumberPath)
    const prevVerse = MyEditor.getPreviousVerse(editor, verseNumberPath)

    return prevVerse != undefined ||
        isVerseRange ||
        (
            useVerseAddRemove && 
            isLastVerse
        )
}

type VerseSubmenuProps = {
    editor: ReactEditor,
    verseNumberPath: Path,
}

class VerseSubmenu extends React.Component<VerseSubmenuProps> {
    getVerseNumberString() {
        const { editor, verseNumberPath } = this.props
        const [verseNumberNode] = MyEditor.node(editor, verseNumberPath)
        return Node.string(verseNumberNode)
    }
    static propTypes = {
        editor: PropTypes.object.isRequired,
        verseNumberPath: PropTypes.array.isRequired
    }
}

class VerseJoinUnjoinSubmenu extends VerseSubmenu {
    render() {
        const { editor, verseNumberPath } = this.props
        const verseNumberString = this.getVerseNumberString()
        const isVerseRange = verseNumberString.includes('-')
        const prevVerse = MyEditor.getPreviousVerse(editor, verseNumberPath)
        return (
            <UIComponentContext.Consumer>
                {({JoinWithPreviousVerseButton, UnjoinVerseRangeButton}) => 
                    <React.Fragment>
                        {
                            prevVerse &&
                                <JoinWithPreviousVerseButton
                                    handleClick={event => {
                                        // !!Important: handleClose (property of VerseNumberMenu) is 
                                        // not necessary in any of the verse menu buttons since all 
                                        // verse transforms either remove or replace the verse number 
                                        // (along with its verse menu), effectively "closing" the menu.
                                        // Calling handleClose after a verse number is removed will 
                                        // cause an error.
                                        MyTransforms.joinWithPreviousVerse(editor, verseNumberPath)
                                        ReactEditor.focus(editor)
                                    }}
                                />
                        }
                        {
                            isVerseRange &&
                                <UnjoinVerseRangeButton
                                    handleClick={event => {
                                        MyTransforms.unjoinVerses(editor, verseNumberPath)
                                        ReactEditor.focus(editor)
                                    }}
                                />
                        }
                    </React.Fragment>
                }
            </UIComponentContext.Consumer>
        )
    }
}

class VerseAddRemoveSubmenu extends VerseSubmenu {
    render() {
        const { editor, verseNumberPath } = this.props
        const isLastVerse = MyEditor.getLastVerseNumberOrRange(editor, verseNumberPath) ==
            this.getVerseNumberString()
        const prevVerse = MyEditor.getPreviousVerse(editor, verseNumberPath)
        return (
            <UIComponentContext.Consumer>
                {({AddVerseButton, RemoveVerseButton}) => 
                    <React.Fragment>
                        {
                            isLastVerse &&
                                <AddVerseButton
                                    handleClick={event => {
                                        MyTransforms.addVerse(editor, verseNumberPath)
                                        ReactEditor.focus(editor)
                                    }}
                                />
                        }
                        {
                            isLastVerse &&
                            prevVerse && // Don't show remove button if this is the only verse
                                <RemoveVerseButton
                                    handleClick={event => {
                                        MyTransforms.removeVerseAndConcatenateContentsWithPrevious(
                                            editor,
                                            verseNumberPath
                                        )
                                        ReactEditor.focus(editor)
                                    }}
                                />
                        }
                    </React.Fragment>
                }
            </UIComponentContext.Consumer>
        )
    }
}