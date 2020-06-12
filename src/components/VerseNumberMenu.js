import * as React from 'react'
import { useSlate } from 'slate-react'
import { MyTransforms } from '../plugins/helpers/MyTransforms'
import { MyEditor } from '../plugins/helpers/MyEditor'
import { ContextMenu } from './ContextMenu'
import { flowRight } from "lodash"

import { compose } from "../utils/commonFunctions"
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


  const StyledMenuItem = withStyles((theme) => ({
    root: {
      '&:focus': {
        backgroundColor: theme.palette.primary.main,
        '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
          color: theme.palette.common.white,
        },
      },
    },
  }))(MenuItem);

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
            (Menu) => withVerseJoinUnjoin(Menu, verseNumberString),
            includeVerseAddRemove
                ? (Menu) => withVerseAddRemove(Menu, verseNumberString)
                : null,
            BaseMenu
        ].filter(fn => fn) // filter not null

        const MenuWithButtons = flowRight(...functionsRightToLeft)()

    return <MenuWithButtons />
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
                ? <AddVerseButton editor={editor} />
                : null
            }
            {
                isLastVerse
                ? <RemoveVerseButton editor={editor} />
                : null
            }
        </React.Fragment>
    )
}

const VerseMenuButton = ({ 
    Icon,
    text,
    handleClick
}) => {
    return (
        <StyledMenuItem
            onClick={event => {handleClick()}}
        >
            <ListItemIcon>
                <Icon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={text} />
        </StyledMenuItem>
    )
}

const JoinWithPreviousVerseButton = ({ editor }) => {
    return (
        <VerseMenuButton
            Icon={LinkIcon}
            text={"Merge with previous verse"}
            handleClick={event => {
                MyTransforms.joinWithPreviousVerse(editor)
            }}
        />
    )
}

const UnjoinVerseRangeButton = ({ editor }) => {
    return (
        <VerseMenuButton
            Icon={LinkOffIcon}
            text={"Unjoin verses"}
            handleClick={event => {
                MyTransforms.unjoinVerses(editor)
            }}
        />
    )
}

const AddVerseButton = ({ editor }) => {
    return (
        <VerseMenuButton
            Icon={AddIcon}
            text={"Add verse"}
            handleClick={event => {
                MyTransforms.addVerse(editor)
            }}
        />
    )
}

const RemoveVerseButton = ({ editor }) => {
    return (
        <VerseMenuButton
            Icon={DeleteIcon}
            text={"Remove verse"}
            handleClick={event => {
                MyTransforms.removeVerseAndConcatenateContentsWithPrevious(editor)
            }}
        />
    )
}