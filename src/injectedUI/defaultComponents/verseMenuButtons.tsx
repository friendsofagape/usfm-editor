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
    handleClick: () => void,
}
class VerseMenuButton extends Component<VerseMenuButtonProps> {
    static propTypes = {
        icon: PropTypes.elementType.isRequired,
        text: PropTypes.string.isRequired,
        handleClick: PropTypes.func.isRequired
    }
    render() {
        return (
            <MenuItem
                onClick={event => { this.props.handleClick() }}
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