import * as React from "react";

export const DropdownMenu = ({ id, onChange, demoUsfmStrings }) => {
    return (
        <select id={id} required onChange={onChange}>
        {
            Array.from(demoUsfmStrings).map(function(arr) {
                const [k, v] = arr;
                return <option key={k} value={v}>{k}</option>;
            })
        }
        </select>
    )
}