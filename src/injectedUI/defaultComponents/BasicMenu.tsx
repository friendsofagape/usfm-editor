import * as React from 'react'
import { ForwardRefExoticComponent } from "react"
import MenuList from '@material-ui/core/MenuList'
import Paper from '@material-ui/core/Paper'

export const BasicMenu: ForwardRefExoticComponent<any> = React.forwardRef(
    ({ ...props }, ref) => (
        <Paper>
            <MenuList
                //@ts-ignore
                ref={ref}>
                    {props.children}
            </MenuList>
        </Paper>
    )
)
export default BasicMenu