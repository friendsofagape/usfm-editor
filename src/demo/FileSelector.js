import * as React from "react";

export const FileSelector = ({ id, onChange }) => {

    const fileReader = (() => {
        const reader = new FileReader();
        reader.onload = (e) => {
            onChange(e.target.fileName, e.target.result)
        }
        return reader
    })()

    const onFileChange = event => {
        const file = event.target.files[0]
        if (file) {
            fileReader.fileName = file.name
            fileReader.readAsText(file)
        }
    }

    const handleOnClick = () => {
        document.getElementById(id).click()
    }

    return (
        <div>
            <input
                id={id}
                type="file" 
                style={{display: "none"}}
                accept=".usfm,.txt" 
                onChange={onFileChange} 
            />
            <input
                type="button"
                value="Choose File"
                onClick={handleOnClick}
            />
        </div>
    )
}