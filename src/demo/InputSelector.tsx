import * as React from "react";
import { useMemo } from 'react';
import { FileSelector } from "./FileSelector"
import { DropdownMenu } from "./DropdownMenu"

type Props = {
    onChange: (s: string) => void,
    demoUsfmStrings: Map<string, string>
}

export const InputSelector: React.FC<Props> = (
    { onChange, demoUsfmStrings }: Props
) => useMemo(() => {

    const dropdownMenuId = "input-dropdown"
    const fileSelectorId = "input-file"

    const selectOrAddOptionToDropdown = (fileName: string, usfm: string) => {
        const optionId = dropdownMenuId + '-' + fileName

        const dropdown: HTMLSelectElement | null =
            document.getElementsByTagName("select").namedItem(dropdownMenuId)
        const prevCreatedOption: HTMLOptionElement | null =
            dropdown?.namedItem(optionId)

        if (prevCreatedOption) {
            // update this option with the current data loaded from the file
            prevCreatedOption.value = usfm 
        } else {
            const opt = document.createElement("option")
            opt.id = optionId
            opt.value = usfm
            opt.innerHTML = fileName
            dropdown.appendChild(opt)
        }
        dropdown.value = usfm
    }

    const unsetSelectedFile = () => {
        // The <input> tag keeps track of the last file that was selected.
        // We want to unset it so that we can load the same file again.
        const fileSelector: HTMLInputElement | null =
            document.getElementsByTagName("input").namedItem(fileSelectorId)
        if (fileSelector) fileSelector.value = null
    }

    const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(event.target.value)
        unsetSelectedFile()
    }

    const handleInputFileChange = (fileName: string, usfm: string) => {
        onChange(usfm)
        selectOrAddOptionToDropdown(fileName, usfm)
    }

    return (
        <div>
            <div className="row">
                <div className="column">
                    <h2 className="demo-header">
                        Demo text selection
                    </h2>
                </div>
            </div>
            <div className="horizontal">
                <DropdownMenu
                    id={dropdownMenuId}
                    onChange={handleDropdownChange}
                    demoUsfmStrings={demoUsfmStrings}
                />
                <span>OR</span>
                <FileSelector 
                    id={fileSelectorId}
                    onChange={handleInputFileChange} 
                />
            </div>
        </div>
    )
}, [])
