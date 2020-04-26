import * as React from "react";
import { useMemo } from 'react';
import { FileSelector } from "./FileSelector"
import { DropdownMenu } from "./DropdownMenu"

export const InputSelector = ({ onChange, demoUsfmStrings }) => useMemo(() => {

    const dropdownMenuId = "input-dropdown"

    const selectOrAddUsfmFileToDropdown = (fileName, usfm) => {
        const dropdown = document.getElementById(dropdownMenuId)
        const children = Array.from(dropdown.children)
        const prevCreatedOption = children.find(child => child.key == fileName)

        if (prevCreatedOption) {
            prevCreatedOption.value = usfm
        } else {
            const opt = document.createElement("option")
            opt.key = fileName
            opt.value = usfm
            opt.innerHTML = fileName
            dropdown.appendChild(opt)
        }
        dropdown.value = usfm
    }

    const handleDropdownChange = (event) => {
        onChange(event.target.value)
    }

    const handleInputFileChange = (fileName, usfm) => {
        onChange(usfm)
        selectOrAddUsfmFileToDropdown(fileName, usfm)
    }

    return (
        <div>
            <div className="row">
                <div className="column">
                    <h2 className="margin-below-15px">Demo text selection</h2>
                </div>
            </div>
            <div className="horizontal">
                <DropdownMenu
                    id={dropdownMenuId}
                    onChange={handleDropdownChange}
                    demoUsfmStrings={demoUsfmStrings}
                />
                <span>OR</span>
                <FileSelector onChange={handleInputFileChange} />
            </div>
        </div>
    )
}, [])