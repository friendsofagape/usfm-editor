import * as React from "react";

type Props = {
    id: string,
    text: string,
    checked: boolean,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const OptionCheckbox: React.FC<Props> = (
    { id, text, checked, onChange }: Props
) => {
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
