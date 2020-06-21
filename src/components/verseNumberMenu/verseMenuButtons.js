import * as React from 'react'
import { withStyles } from '@material-ui/core/styles';
import { PropTypes } from "prop-types"
import MenuItem from '@material-ui/core/MenuItem';

import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import LinkIcon from '@material-ui/icons/Link';
import LinkOffIcon from '@material-ui/icons/LinkOff';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';

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

const BasicMenuItem = withStyles(menuItemStyles)(MenuItem);

class VerseMenuButton extends React.Component {
    render() {
        return (
            <BasicMenuItem
                onClick={event => { this.props.handleClick() }}
            >
                <ListItemIcon>
                    <this.props.icon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={this.props.text} />
            </BasicMenuItem>
        )
    }
}
VerseMenuButton.propTypes = {
    icon: PropTypes.elementType.isRequired,
    text: PropTypes.string.isRequired,
    handleClick: PropTypes.func.isRequired
}

export const JoinWithPreviousVerseButton = ({ handleClick }) => {
    return (
        <VerseMenuButton
            icon={LinkIcon}
            text={"Join with previous verse"}
            handleClick={handleClick}
        />
    )
}

export const UnjoinVerseRangeButton = ({ handleClick }) => {
    return (
        <VerseMenuButton
            icon={LinkOffIcon}
            text={"Unjoin verses"}
            handleClick={handleClick}
        />
    )
}

export const AddVerseButton = ({ handleClick }) => {
    return (
        <VerseMenuButton
            icon={AddIcon}
            text={"Add verse"}
            handleClick={handleClick}
        />
    )
}

export const RemoveVerseButton = ({ handleClick }) => {
    return (
        <VerseMenuButton
            icon={DeleteIcon}
            text={"Remove verse"}
            handleClick={handleClick}
        />
    )
}