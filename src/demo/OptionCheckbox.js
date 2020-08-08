import * as React from "react";

export const OptionCheckbox = ({ id, text, checked, onChange }) => {
    return (
        <span className="option-checkbox">
            <input 
                type="checkbox"
                id={id}
                onChange={onChange} 
                checked={checked}
            />
            <label htmlFor={id} className="no-select">
                {text}
            </label>
        </span>
    )
}