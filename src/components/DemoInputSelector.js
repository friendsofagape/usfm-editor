import * as React from "react";
import { useMemo, useState } from 'react';

export const DemoInputSelector = ({ onChange, demoUsfmStrings }) => {

    const handleDropdownChange = 
        e => onChange(e.target.value)

    const fileReader = (() => {
        const reader = new FileReader();
        reader.onload = (e) => {
            onChange(e.target.result)
        }
        return reader
    })()

    const handleInputFileChange = 
        event => {
            const file = event.target.files[0]
            fileReader.readAsText(file)
        }

    const DropdownMenu = ({ onChange, demoUsfmStrings }) => {
        return (
            <form>
                <select required onChange={onChange}>
                {
                    Array.from(demoUsfmStrings).map(function(arr) {
                        const [k, v] = arr;
                        return <option key={k} value={v}>{k}</option>;
                    })
                }
                </select>
            </form>
        )
    }

    const dropdownMenu = useMemo(() => 
        <DropdownMenu
            onChange={handleDropdownChange}
            demoUsfmStrings={demoUsfmStrings}
        />,
    [])

    const FileSelector = ({ onChange }) => {
        return (
            <input type="file" accept=".usfm,.txt" onChange={onChange} />
        )
    }

    const fileSelector = useMemo(() =>
        <FileSelector onChange={handleInputFileChange} />,
    [])

    return (
        <div>
            <div class="row">
                <div class="column">
                    <h2 class="margin-below-15px">Demo text selection</h2>
                </div>
            </div>
            <div class="horizontal">
                {dropdownMenu}
                <span>OR</span>
                {fileSelector}
            </div>
        </div>
    )
}