import * as React from 'react'
import { useContext } from 'react'
import { Node } from "slate"
import { useSlate } from 'slate-react'
import { MyTransforms } from '../plugins/helpers/MyTransforms'
import { MyEditor } from '../plugins/helpers/MyEditor'
import { PropTypes } from "prop-types"
import { flowRight } from "lodash"
import { UIComponentContext } from "../injectedUI/UIComponentContext"

function emptyMenu(anchorEl, handleClose) {
    return function (props) {
        const { VerseMenu } = useContext(UIComponentContext)
        return <VerseMenu
            {...props}
            anchorEl={anchorEl}
            handleClose={handleClose}
        />
    }
}

export const VerseNumberMenu = React.forwardRef((
    {
        anchorEl,
        handleClose,
        includeVerseAddRemove = true
    },
    ref
) => {
    if (!anchorEl) return null

    const editor = useSlate()
    const verseNumberPath = MyEditor.getPathFromDOMNode(editor, anchorEl)

    const EmptyMenu = () => emptyMenu(anchorEl, handleClose)
    const functionsRightToLeft = [
        (Menu) => withVerseJoinUnjoin(Menu, verseNumberPath),
        includeVerseAddRemove
            ? (Menu) => withVerseAddRemove(Menu, verseNumberPath)
            : null,
        EmptyMenu
    ].filter(fn => fn) // filter not null

    const MenuWithButtons = flowRight(...functionsRightToLeft)()

    return <MenuWithButtons />
})

function withVerseJoinUnjoin(VerseMenu, verseNumberPath) {
    return function (props) {
        const editor = useSlate()
        return (
            <VerseMenu {...props}>
                {...props.children}
                <VerseJoinUnjoinSubmenu
                    editor={editor}
                    verseNumberPath={verseNumberPath}
                />
            </VerseMenu>
        )
    }
}

function withVerseAddRemove(VerseMenu, verseNumberPath) {
    return function (props) {
        const editor = useSlate()
        return (
            <VerseMenu {...props}>
                {...props.children}
                <VerseAddRemoveSubmenu
                    editor={editor}
                    verseNumberPath={verseNumberPath}
                />
            </VerseMenu>
        )
    }
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
                            startOfVerseRange > 1
                                ? <JoinWithPreviousVerseButton
                                    handleClick={event => {
                                        MyTransforms.joinWithPreviousVerse(editor, verseNumberPath)
                                    }}
                                />
                                : null
                        }
                        {
                            isVerseRange
                                ? <UnjoinVerseRangeButton
                                    handleClick={event => {
                                        MyTransforms.unjoinVerses(editor, verseNumberPath)
                                    }}
                                />
                                : null
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
                            isLastVerse
                                ? <AddVerseButton
                                    handleClick={event => {
                                        MyTransforms.addVerse(editor, verseNumberPath)
                                    }}
                                />
                                : null
                        }
                        {
                            isLastVerse
                                ? <RemoveVerseButton
                                    handleClick={event => {
                                        MyTransforms.removeVerseAndConcatenateContentsWithPrevious(
                                            editor,
                                            verseNumberPath
                                        )
                                    }}
                                />
                                : null
                        }
                    </React.Fragment>
                }
            </UIComponentContext.Consumer>
        )
    }
}