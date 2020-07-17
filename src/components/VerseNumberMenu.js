import * as React from 'react'
import { useContext } from 'react'
import { Node } from "slate"
import { useSlate, ReactEditor } from 'slate-react'
import { MyTransforms } from '../plugins/helpers/MyTransforms'
import { MyEditor } from '../plugins/helpers/MyEditor'
import { PropTypes } from "prop-types"
import { UIComponentContext } from "../injectedUI/UIComponentContext"
import Popper from '@material-ui/core/Popper'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'

export const VerseNumberMenu = ({
    verseNumberEl,
    open,
    handleClose,
    useVerseAddRemove
}) => {
    if (!verseNumberEl) return null

    const { VerseMenu } = useContext(UIComponentContext)
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
    editor,
    verseNumberEl,
    useVerseAddRemove
) {
    // This will find the verse path. We need the verse number path, so concatenate a zero.
    const verseNumberPath = MyEditor.getPathFromDOMNode(editor, verseNumberEl)
        .concat(0)
    const [verseNumberNode, path] = MyEditor.node(editor, verseNumberPath)
    const verseNumberString = Node.string(verseNumberNode)

    const [startOfVerseRange, endOfVerseRange] = verseNumberString.split('-')
    const isVerseRange = verseNumberString.includes('-')
    const isLastVerse = verseNumberString == 
        MyEditor.getLastVerseNumberOrRange(editor, verseNumberPath)

    return startOfVerseRange > 1 ||
        isVerseRange ||
        (
            useVerseAddRemove && 
            isLastVerse
        )
}

class VerseSubmenu extends React.Component {
    getVerseNumberString() {
        const { editor, verseNumberPath } = this.props
        const [verseNumberNode, path] = MyEditor.node(editor, verseNumberPath)
        return Node.string(verseNumberNode)
    }
}
VerseSubmenu.propTypes = {
    editor: PropTypes.object.isRequired,
    verseNumberPath: PropTypes.array.isRequired
}

class VerseJoinUnjoinSubmenu extends VerseSubmenu {
    render() {
        const { editor, verseNumberPath } = this.props
        const verseNumberString = this.getVerseNumberString()
        const [startOfVerseRange, endOfVerseRange] = verseNumberString.split('-')
        const isVerseRange = verseNumberString.includes('-')
        return (
            <UIComponentContext.Consumer>
                {({JoinWithPreviousVerseButton, UnjoinVerseRangeButton}) => 
                    <React.Fragment>
                        {
                            startOfVerseRange > 1 &&
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