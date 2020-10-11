import * as React from "react";

export const IdentificationSetter = ({ idJson, onChange }) => {
    const textInputRef = React.createRef()
    return (
        <div className="identification-setter">
            <div className="row">
                <div className="column">
                    <h4 className="demo-header">
                        Identification Headers
                    </h4>
                </div>
            </div>
            <span className="identification-input">
                <input 
                    type="text" 
                    key={idJson}
                    ref={textInputRef} 
                    defaultValue={idJson} 
                    style={{width: "100%"}}
                />
            </span>
            <span className="identification-button">
                <button onClick={event => 
                    onChange(textInputRef.current.value)
                }>Set</button>
            </span>
        </div>
    )
}