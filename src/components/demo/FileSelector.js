import * as React from "react";

export const FileSelector = ({ onChange }) => {

    const fileReader = (() => {
        const reader = new FileReader();
        reader.onload = (e) => {
            onChange(e.target.fileName, e.target.result)
        }
        return reader
    })()

    const onFileChange = 
        event => {
            const file = event.target.files[0]
            fileReader.fileName = file.name
            fileReader.readAsText(file)
        }

    return (
        <input type="file" className="text-no-display" accept=".usfm,.txt" onChange={onFileChange} />
    )
}