import * as React from 'react'
import { withStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import { PropTypes } from "prop-types"

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

export const BasicMenu = (props) => {
    return (
        <StyledMenu
            anchorEl={props.anchorEl}
            keepMounted
            open={Boolean(props.anchorEl)}
            onClose={props.handleClose}
            onClick={props.handleClose}
        >
            {...props.children}
        </StyledMenu>
    )
}
BasicMenu.propTypes = {
    anchorEl: PropTypes.any.isRequired,
    handleClose: PropTypes.func.isRequired
}