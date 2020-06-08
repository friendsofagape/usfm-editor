import * as React from 'react'
import { useSlate } from 'slate-react'
import { Button } from './menu/menuComponents'
import { MyTransforms } from '../plugins/helpers/MyTransforms'
import { MyEditor } from '../plugins/helpers/MyEditor'
import { ContextMenu } from './ContextMenu'
import { compose } from "../utils/commonFunctions"

export const VerseNumberMenu = ({
    verseNumberRef,
    verseNumberString
}) => {
        const BaseMenu = () => withContextRef(ContextMenu, verseNumberRef)
        const MenuWithButtons = compose(
            (Menu) => withVerseJoinUnjoin(Menu, verseNumberString),
            (Menu) => withVerseAddRemove(Menu, verseNumberString),
            BaseMenu
        )()
    return <MenuWithButtons />
}

function withContextRef(ContextMenu, contextRef) {
    return function(props) {
        return <ContextMenu {...props} contextRef={contextRef} />
    }
}

function withVerseJoinUnjoin(VerseMenu, verseNumberString) {
    return function (props) {
        return (
            <VerseMenu {...props}>
                {...props.children}
                <VerseJoinUnjoinMenuFragment
                    verseNumberString={verseNumberString}
                />
            </VerseMenu>
        )
    }
}

function withVerseAddRemove(VerseMenu, verseNumberString) {
    return function (props) {
        return (
            <VerseMenu {...props}>
                {...props.children}
                <VerseAddRemoveMenuFragment
                    verseNumberString={verseNumberString}
                />
            </VerseMenu>
        )
    }
}

const VerseJoinUnjoinMenuFragment = ({
    verseNumberString
}) => {
    const editor = useSlate()
    const [startOfVerseRange, endOfVerseRange] = verseNumberString.split('-')
    const isVerseRange = verseNumberString.includes('-')
    return (
        <React.Fragment>
            {
                startOfVerseRange > 1
                ? <JoinWithPreviousVerseButton editor={editor} />
                : null
            }
            {
                isVerseRange
                ? <UnjoinVerseRangeButton editor={editor} />
                : null
            }
        </React.Fragment>
    )
}

const VerseAddRemoveMenuFragment = ({
    verseNumberString
}) => {
    const editor = useSlate()
    const isLastVerse = MyEditor.getLastVerseNumberOrRange(editor) == verseNumberString
    return (
        <React.Fragment>
            {
                isLastVerse
                ? <RemoveVerseButton editor={editor} />
                : null
            }
            {
                isLastVerse
                ? <AddVerseButton editor={editor} />
                : null
            }
        </React.Fragment>
    )
}

const JoinWithPreviousVerseButton = ({ editor }) => {
    return (
        <Button
            active={true}
            onMouseDown={event => {
                MyTransforms.joinWithPreviousVerse(editor)
            }}
        >
            Merge with previous verse
        </Button>
    )
}

const UnjoinVerseRangeButton = ({ editor }) => {
    return (
        <Button
            active={true}
            onMouseDown={event => {
                MyTransforms.unjoinVerses(editor)
            }}
        >
            Unjoin verses
        </Button>
    )
}

const AddVerseButton = ({ editor }) => {
    return (
        <Button
            active={true}
            onMouseDown={event => {
                MyTransforms.addVerse(editor)
            }}
        >
            Add verse
        </Button>
    )
}

const RemoveVerseButton = ({ editor }) => {
    return (
        <Button
            active={true}
            onMouseDown={event => {
                MyTransforms.removeVerseAndConcatenateContentsWithPrevious(editor)
            }}
        >
            Remove verse
        </Button>
    )
}