import * as React from "react";
import "./demo.css";

export const OutputUsfm = ({ usfm }) => {
    return (
        <div>
            <h2>Output USFM</h2>
            <pre className="usfm-container">{usfm}</pre>
        </div>
    )
}