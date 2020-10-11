import * as React from "react";

export const UsfmContainer = ({ title, usfm }) => {
    return (
        <div>
            <h2>{title}</h2>
            <pre className="usfm-container">{usfm}</pre>
        </div>
    )
}

export const InputUsfm = ({ usfm }) => {
    return (
        <UsfmContainer
            title={"Input USFM"}
            usfm={usfm}
        />
    )
}

export const OutputUsfm = ({ usfm }) => {
    return (
        <UsfmContainer
            title={"Output USFM"}
            usfm={usfm}
        />
    )
}