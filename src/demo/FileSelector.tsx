import * as React from "react";

type Props = {
    id: string,
    onChange: (filename: string, contents: string) => void,
}

export const FileSelector: React.FC<Props> = (
    { id, onChange }: Props
) => {

    const handleOnFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files[0]
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>) => {
                onChange(file.name, e.target.result.toString())
            }
            reader.readAsText(file)
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
                onChange={handleOnFileChange} 
            />
            <input
                type="button"
                value="Choose File"
                onClick={handleOnClick}
            />
        </div>
    )
}
