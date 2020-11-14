import React, { Component, FC } from 'react'
import PropTypes from "prop-types"
import MenuItem from '@material-ui/core/MenuItem';
import { HasHandleClick } from "../../injectedUI/UIComponentContext"

import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import LinkIcon from '@material-ui/icons/Link';
import LinkOffIcon from '@material-ui/icons/LinkOff';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';

interface VerseMenuButtonProps {
    icon: PropTypes.ReactComponentLike
    text: string,
    handleClick: (event) => void,
}

const PROP_TYPES = {
    icon: PropTypes.elementType.isRequired,
    text: PropTypes.string.isRequired,
    handleClick: PropTypes.func.isRequired
} as const

class VerseMenuButton extends Component<VerseMenuButtonProps> {
    static propTypes = PROP_TYPES
    render() {
        return (
            <MenuItem
                onClick={ this.props.handleClick }
            >
                <ListItemIcon>
                    <this.props.icon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={this.props.text} />
            </MenuItem>
        )
    }
}

export const JoinWithPreviousVerseButton: FC<HasHandleClick> = (
    { handleClick }
) => {
    return (
        <VerseMenuButton
            icon={LinkIcon}
            text={"Join with previous verse"}
            handleClick={handleClick}
        />
    )
}
JoinWithPreviousVerseButton.propTypes = PROP_TYPES

export const UnjoinVerseRangeButton: FC<HasHandleClick> = (
    { handleClick }
) => {
    return (
        <VerseMenuButton
            icon={LinkOffIcon}
            text={"Unjoin verses"}
            handleClick={handleClick}
        />
    )
}
UnjoinVerseRangeButton.propTypes = PROP_TYPES

export const AddVerseButton: FC<HasHandleClick> = (
    { handleClick }
) => {
    return (
        <VerseMenuButton
            icon={AddIcon}
            text={"Add verse"}
            handleClick={handleClick}
        />
    )
}
AddVerseButton.propTypes = PROP_TYPES

export const RemoveVerseButton: FC<HasHandleClick> = (
    { handleClick }
) => {
    return (
        <VerseMenuButton
            icon={DeleteIcon}
            text={"Remove verse"}
            handleClick={handleClick}
        />
    )
}
RemoveVerseButton.propTypes = PROP_TYPES
