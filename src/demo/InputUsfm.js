import * as React from "react";
import "./demo.css";

export const InputUsfm = ({ usfm, showInput, onShowInputChange }) => {

    const inputUsfm = 
        <div>
            <h2>Input USFM</h2>
            <pre className="usfm-container">{usfm}</pre>
        </div>;

    return (
        <div>
            <div className="center-horizontal">
                <input 
                    type="checkbox"
                    id="input-checkbox" 
                    onChange={onShowInputChange} 
                    checked={showInput}
                />
                <label for="input-checkbox" className="no-select">
                    Show input
                </label>
            </div>
            { 
                showInput
                    ? inputUsfm
                    : null
            }
        </div>
    )
}