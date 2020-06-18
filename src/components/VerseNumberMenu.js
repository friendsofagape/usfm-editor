import * as React from 'react'
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
    anchorEl, // This is the verse number DOM Node
    onClickOutside,
    includeVerseAddRemove = true
}) => {
        const BaseMenu = () => materialMenu(anchorEl, onClickOutside)
        const functionsRightToLeft = [
            (Menu) => withVerseJoinUnjoin(Menu, anchorEl),
            includeVerseAddRemove
                ? (Menu) => withVerseAddRemove(Menu, anchorEl)
                : null,
            BaseMenu
        ].filter(fn => fn) // filter not null

        const MenuWithButtons = flowRight(...functionsRightToLeft)()

    return <MenuWithButtons />
}

function withVerseJoinUnjoin(VerseMenu, verseNumberDOMNode) {
    return function (props) {
        const editor = useSlate()
        return (
            <VerseMenu {...props}>
                {...props.children}
                <VerseJoinUnjoinSubmenu
                    editor={editor}
                    verseNumberDOMNode={verseNumberDOMNode}
                />
            </VerseMenu>
        )
    }
}

function withVerseAddRemove(VerseMenu, verseNumberDOMNode) {
    return function (props) {
        const editor = useSlate()
        return (
            <VerseMenu {...props}>
                {...props.children}
                <VerseAddRemoveSubmenu
                    editor={editor}
                    verseNumberDOMNode={verseNumberDOMNode}
                />
            </VerseMenu>
        )
    }
}

class VerseJoinUnjoinSubmenu extends React.Component {
    render() {
        const verseNumberString = this.props.verseNumberDOMNode.innerText
        const [startOfVerseRange, endOfVerseRange] = verseNumberString.split('-')
        const isVerseRange = verseNumberString.includes('-')
        return (
            <React.Fragment>
                {
                    startOfVerseRange > 1
                    ? <JoinWithPreviousVerseButton
                        editor={this.props.editor} 
                        verseNumberDOMNode={this.props.verseNumberDOMNode}
                      />
                    : null
                }
                {
                    isVerseRange
                    ? <UnjoinVerseRangeButton
                        editor={this.props.editor} 
                        verseNumberDOMNode={this.props.verseNumberDOMNode}
                      />
                    : null
                }
            </React.Fragment>
        )
    }
}

class VerseAddRemoveSubmenu extends React.Component {
    isLastVerse() {
        const verseNumberString = this.props.verseNumberDOMNode.innerText
        const path = MyEditor.getPathFromDOMNode(
            this.props.editor, 
            this.props.verseNumberDOMNode
        )
        return MyEditor.getLastVerseNumberOrRange(this.props.editor, path) == verseNumberString
    }
    render() {
        const lastVerse = this.isLastVerse()
        return (
            <React.Fragment>
                {
                    lastVerse
                    ? <AddVerseButton 
                        editor={this.props.editor} 
                        verseNumberDOMNode={this.props.verseNumberDOMNode}
                      />
                    : null
                }
                {
                    lastVerse
                    ? <RemoveVerseButton 
                        editor={this.props.editor}
                        verseNumberDOMNode={this.props.verseNumberDOMNode}
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

const JoinWithPreviousVerseButton = ({ editor, verseNumberDOMNode }) => {
    return (
        <VerseMenuButton
            icon={LinkIcon}
            text={"Merge with previous verse"}
            handleClick={event => {
                MyTransforms.joinWithPreviousVerse(editor, verseNumberDOMNode)
            }}
        />
    )
}

const UnjoinVerseRangeButton = ({ editor, verseNumberDOMNode }) => {
    return (
        <VerseMenuButton
            icon={LinkOffIcon}
            text={"Unjoin verses"}
            handleClick={event => {
                MyTransforms.unjoinVerses(editor, verseNumberDOMNode)
            }}
        />
    )
}

const AddVerseButton = ({ editor, verseNumberDOMNode }) => {
    return (
        <VerseMenuButton
            icon={AddIcon}
            text={"Add verse"}
            handleClick={event => {
                MyTransforms.addVerse(editor, verseNumberDOMNode)
            }}
        />
    )
}

const RemoveVerseButton = ({ editor, verseNumberDOMNode }) => {
    return (
        <VerseMenuButton
            icon={DeleteIcon}
            text={"Remove verse"}
            handleClick={event => {
                MyTransforms.removeVerseAndConcatenateContentsWithPrevious(editor, verseNumberDOMNode)
            }}
        />
    )
}