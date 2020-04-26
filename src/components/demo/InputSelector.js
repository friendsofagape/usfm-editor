import * as React from "react";
import { useMemo } from 'react';
import { FileSelector } from "./FileSelector"
import { DropdownMenu } from "./DropdownMenu"

export const InputSelector = ({ onChange, demoUsfmStrings }) => useMemo(() => {

    const dropdownMenuId = "input-dropdown"

    const addUsfmFileToDropdown = (fileName, usfm) => {
        const dropdown = document.getElementById(dropdownMenuId)
        const opt = document.createElement("option")
        opt.key = fileName
        opt.value = usfm
        opt.innerHTML = fileName
        dropdown.appendChild(opt)
        dropdown.value = usfm
    }

    const handleDropdownChange = (event) => {
        onChange(event.target.value)
    }

    const handleInputFileChange = (fileName, usfm) => {
        onChange(usfm)
        addUsfmFileToDropdown(fileName, usfm)
    }

    return (
        <div>
            <div class="row">
                <div class="column">
                    <h2 class="margin-below-15px">Demo text selection</h2>
                </div>
            </div>
            <div class="horizontal">
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