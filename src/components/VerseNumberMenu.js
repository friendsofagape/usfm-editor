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
    anchorEl,
    onClickOutside,
    verseNumberString,
    includeVerseAddRemove = true
}) => {
        const BaseMenu = () => materialMenu(anchorEl, onClickOutside)
        const functionsRightToLeft = [
            (Menu) => withVerseJoinUnjoin(Menu, anchorEl, verseNumberString),
            includeVerseAddRemove
                ? (Menu) => withVerseAddRemove(Menu, anchorEl, verseNumberString)
                : null,
            BaseMenu
        ].filter(fn => fn) // filter not null

        const MenuWithButtons = flowRight(...functionsRightToLeft)()

    return <MenuWithButtons />
}

function withVerseJoinUnjoin(VerseMenu, verseNumberRef, verseNumberString) {
    return function (props) {
        const editor = useSlate()
        return (
            <VerseMenu {...props}>
                {...props.children}
                <VerseJoinUnjoinMenuFragment
                    editor={editor}
                    verseNumberString={verseNumberString}
                    verseNumberRef={verseNumberRef}
                />
            </VerseMenu>
        )
    }
}

function withVerseAddRemove(VerseMenu, verseNumberRef, verseNumberString) {
    return function (props) {
        const editor = useSlate()
        return (
            <VerseMenu {...props}>
                {...props.children}
                <VerseAddRemoveMenuFragment
                    editor={editor}
                    verseNumberString={verseNumberString}
                    verseNumberRef={verseNumberRef}
                />
            </VerseMenu>
        )
    }
}

class VerseJoinUnjoinMenuFragment extends React.Component {
    render() {
        const [startOfVerseRange, endOfVerseRange] = this.props.verseNumberString.split('-')
        const isVerseRange = this.props.verseNumberString.includes('-')
        return (
            <React.Fragment>
                {
                    startOfVerseRange > 1
                    ? <JoinWithPreviousVerseButton
                        editor={this.props.editor} 
                        verseNumberRef={this.props.verseNumberRef}
                      />
                    : null
                }
                {
                    isVerseRange
                    ? <UnjoinVerseRangeButton
                        editor={this.props.editor} 
                        verseNumberRef={this.props.verseNumberRef}
                      />
                    : null
                }
            </React.Fragment>
        )
    }
}

class VerseAddRemoveMenuFragment extends React.Component {
    render() {
        const isLastVerse = 
            MyEditor.getLastVerseNumberOrRange(this.props.editor, this.props.verseNumberRef) == 
                this.props.verseNumberString
        return (
            <React.Fragment>
                {
                    isLastVerse
                    ? <AddVerseButton 
                        editor={this.props.editor} 
                        verseNumberRef={this.props.verseNumberRef}
                      />
                    : null
                }
                {
                    isLastVerse
                    ? <RemoveVerseButton 
                        editor={this.props.editor}
                        verseNumberRef={this.props.verseNumberRef}
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

const JoinWithPreviousVerseButton = ({ editor, verseNumberRef }) => {
    return (
        <VerseMenuButton
            icon={LinkIcon}
            text={"Merge with previous verse"}
            handleClick={event => {
                MyTransforms.joinWithPreviousVerse(editor, verseNumberRef)
            }}
        />
    )
}

const UnjoinVerseRangeButton = ({ editor, verseNumberRef }) => {
    return (
        <VerseMenuButton
            icon={LinkOffIcon}
            text={"Unjoin verses"}
            handleClick={event => {
                MyTransforms.unjoinVerses(editor, verseNumberRef)
            }}
        />
    )
}

const AddVerseButton = ({ editor, verseNumberRef }) => {
    return (
        <VerseMenuButton
            icon={AddIcon}
            text={"Add verse"}
            handleClick={event => {
                MyTransforms.addVerse(editor, verseNumberRef)
            }}
        />
    )
}

const RemoveVerseButton = ({ editor, verseNumberRef }) => {
    return (
        <VerseMenuButton
            icon={DeleteIcon}
            text={"Remove verse"}
            handleClick={event => {
                MyTransforms.removeVerseAndConcatenateContentsWithPrevious(editor, verseNumberRef)
            }}
        />
    )
}