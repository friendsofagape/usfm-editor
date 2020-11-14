import * as React from "react"
import PropTypes from "prop-types"
import MenuList from "@material-ui/core/MenuList"
import Paper from "@material-ui/core/Paper"

const BasicMenu = React.forwardRef<HTMLUListElement, BasicMenuProps>(
    ({ children }, ref) => (
        <Paper>
            <MenuList ref={ref}>{children}</MenuList>
        </Paper>
    )
)

BasicMenu.displayName = "BasicMenu"

BasicMenu.propTypes = {
    children: PropTypes.any,
}

interface BasicMenuProps {
    children: PropTypes.ReactNodeArray
}

export default BasicMenu
