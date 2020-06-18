import * as React from 'react'
import { Node } from "slate"
import { useSlate } from 'slate-react'
import { MyTransforms } from '../plugins/helpers/MyTransforms'
import { MyEditor } from '../plugins/helpers/MyEditor'
import { flowRight } from "lodash"

import { PropTypes } from "prop-types" 

import { withStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import LinkIcon from '@material-ui/icons/Link';
import LinkOffIcon from '@material-ui/icons/LinkOff';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';

const StyledMenu = withStyles({
    paper: {
      border: '1px solid #d3d4d5',
    },
  })((props) => (
    <Menu
      elevation={0}
      getContentAnchorEl={null}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      {...props}
    />
  ));

const menuItemStyles = (theme) => ({
    root: {
      '&:focus': {
        backgroundColor: theme.palette.primary.main,
        '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
          color: theme.palette.common.white,
        },
      },
    },
})

const StyledMenuItem = withStyles(menuItemStyles)(MenuItem);

export const MaterialMenu = (props) => {
    return (
        <StyledMenu
            id="customized-menu"
            anchorEl={props.anchorEl}
            keepMounted
            open={Boolean(props.anchorEl)}
            onClose={props.onClickOutside}
            onClick={props.onClickOutside}
        >
            {...props.children}
        </StyledMenu>
    )
}

MaterialMenu.propTypes = {
    anchorEl: PropTypes.any.isRequired,
    onClickOutside: PropTypes.any.isRequired
}

function materialMenu(anchorEl, onClickOutside) {
    return function(props) {
        return <MaterialMenu 
            {...props}
            anchorEl={anchorEl}
            onClickOutside={onClickOutside}
        />
    }
}

export const VerseNumberMenu = ({
    anchorEl,
    onClickOutside,
    includeVerseAddRemove = true
}) => {
    const editor = useSlate()
    const verseNumberPath = MyEditor.getPathFromDOMNode(editor, anchorEl)

    const BaseMenu = () => materialMenu(anchorEl, onClickOutside)
    const functionsRightToLeft = [
        (Menu) => withVerseJoinUnjoin(Menu, verseNumberPath),
        includeVerseAddRemove
            ? (Menu) => withVerseAddRemove(Menu, verseNumberPath)
            : null,
        BaseMenu
    ].filter(fn => fn) // filter not null

    const MenuWithButtons = flowRight(...functionsRightToLeft)()

    return <MenuWithButtons />
}

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

class VerseSubmenu extends React.Component {}
VerseSubmenu.propTypes = {
    editor: PropTypes.object.isRequired,
    verseNumberPath: PropTypes.array.isRequired
}

class VerseJoinUnjoinSubmenu extends VerseSubmenu {
    render() {
        const { editor, verseNumberPath } = this.props
        const [verseNumberNode, path] = MyEditor.node(editor, verseNumberPath)
        const verseNumberString = Node.string(verseNumberNode)
        const [startOfVerseRange, endOfVerseRange] = verseNumberString.split('-')
        const isVerseRange = verseNumberString.includes('-')
        return (
            <React.Fragment>
                {
                    startOfVerseRange > 1
                    ? <JoinWithPreviousVerseButton
                        editor={this.props.editor} 
                        verseNumberPath={this.props.verseNumberPath}
                      />
                    : null
                }
                {
                    isVerseRange
                    ? <UnjoinVerseRangeButton
                        editor={this.props.editor} 
                        verseNumberPath={this.props.verseNumberPath}
                      />
                    : null
                }
            </React.Fragment>
        )
    }
}

class VerseAddRemoveSubmenu extends VerseSubmenu {
    isLastVerse() {
        const { editor, verseNumberPath } = this.props
        const [verseNumberNode, path] = MyEditor.node(editor, verseNumberPath)
        const verseNumberString = Node.string(verseNumberNode)
        return MyEditor.getLastVerseNumberOrRange(editor, verseNumberPath) == verseNumberString
    }
    render() {
        const lastVerse = this.isLastVerse()
        return (
            <React.Fragment>
                {
                    lastVerse
                    ? <AddVerseButton 
                        editor={this.props.editor} 
                        verseNumberPath={this.props.verseNumberPath}
                      />
                    : null
                }
                {
                    lastVerse
                    ? <RemoveVerseButton 
                        editor={this.props.editor}
                        verseNumberPath={this.props.verseNumberPath}
                      />
                    : null
                }
            </React.Fragment>
        )
    }
}

class VerseMenuButton extends React.Component {
    render() {
        return (
            <StyledMenuItem
                onClick={event => {this.props.handleClick()}}
            >
                <ListItemIcon>
                    <this.props.icon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={this.props.text} />
            </StyledMenuItem>
        )
    }
}
VerseMenuButton.propTypes = {
    handleClick: PropTypes.func.isRequired,
    icon: PropTypes.elementType.isRequired,
    text: PropTypes.string.isRequired
}

const JoinWithPreviousVerseButton = ({ editor, verseNumberPath }) => {
    return (
        <VerseMenuButton
            icon={LinkIcon}
            text={"Merge with previous verse"}
            handleClick={event => {
                MyTransforms.joinWithPreviousVerse(editor, verseNumberPath)
            }}
        />
    )
}

const UnjoinVerseRangeButton = ({ editor, verseNumberPath }) => {
    return (
        <VerseMenuButton
            icon={LinkOffIcon}
            text={"Unjoin verses"}
            handleClick={event => {
                MyTransforms.unjoinVerses(editor, verseNumberPath)
            }}
        />
    )
}

const AddVerseButton = ({ editor, verseNumberPath }) => {
    return (
        <VerseMenuButton
            icon={AddIcon}
            text={"Add verse"}
            handleClick={event => {
                MyTransforms.addVerse(editor, verseNumberPath)
            }}
        />
    )
}

const RemoveVerseButton = ({ editor, verseNumberPath }) => {
    return (
        <VerseMenuButton
            icon={DeleteIcon}
            text={"Remove verse"}
            handleClick={event => {
                MyTransforms.removeVerseAndConcatenateContentsWithPrevious(editor, verseNumberPath)
            }}
        />
    )
}